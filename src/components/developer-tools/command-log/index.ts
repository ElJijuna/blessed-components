import { assertPlainDimensions, fitPlain, plain } from '@/components/shared/text.js';

/** Lifecycle state of an executed command. */
export type CommandLogStatus = 'cancelled' | 'failed' | 'queued' | 'running' | 'succeeded';

/** Retry information associated with a command execution. */
export interface CommandLogRetry {
  /** One-based execution attempt. */
  attempt: number;
  /** Maximum number of attempts, when bounded. */
  maxAttempts?: number;
  /** Human-readable time at which the next retry is scheduled. */
  nextAt?: string;
}

/** One entry in a command execution history. */
export interface CommandLogItem {
  /** Command or action label. This renderer never executes it. */
  command: string;
  /** Optional elapsed-time label. */
  duration?: string;
  /** Process exit code, when available. */
  exitCode?: number;
  /** Stable entry identifier. */
  id: string;
  /** Whether a retry action is currently available. */
  retryable?: boolean;
  /** Retry attempt and schedule metadata. */
  retry?: CommandLogRetry;
  /** Execution state. */
  status: CommandLogStatus;
  /** Human-readable execution timestamp. */
  timestamp?: string;
}

/** Character tokens used by {@link renderCommandLog}. */
export interface CommandLogCharacters {
  active: string;
  inactive: string;
  retry: string;
}

export const COMMAND_LOG_UNICODE_CHARACTERS: Readonly<CommandLogCharacters> = Object.freeze({
  active: '▸',
  inactive: ' ',
  retry: '↻',
});

export const COMMAND_LOG_ASCII_CHARACTERS: Readonly<CommandLogCharacters> = Object.freeze({
  active: '>',
  inactive: ' ',
  retry: 'retry',
});

/** Options accepted by {@link renderCommandLog}. */
export interface RenderCommandLogOptions<TItem extends CommandLogItem = CommandLogItem> {
  activeId?: string;
  characters?: CommandLogCharacters;
  height?: number;
  items: readonly TItem[];
  /** Display latest entries first without mutating `items`. */
  newestFirst?: boolean;
  width?: number;
}

/** Rendered content plus ids visible after height clipping. */
export interface CommandLogRenderResult {
  content: string;
  visibleItemIds: readonly string[];
}

function assertItem(item: CommandLogItem): void {
  if (plain(item.id).trim().length === 0 || plain(item.command).trim().length === 0) {
    throw new RangeError('CommandLog item ids and commands must be non-empty.');
  }

  if (
    item.retry !== undefined &&
    (!Number.isInteger(item.retry.attempt) ||
      item.retry.attempt < 1 ||
      (item.retry.maxAttempts !== undefined &&
        (!Number.isInteger(item.retry.maxAttempts) || item.retry.maxAttempts < item.retry.attempt)))
  ) {
    throw new RangeError('CommandLog retry attempts must be positive and within maxAttempts.');
  }
}

function renderRetry(retry: CommandLogRetry | undefined): string {
  if (retry === undefined) {
    return '';
  }

  const maximum = retry.maxAttempts === undefined ? '' : `/${retry.maxAttempts}`;
  const next = retry.nextAt === undefined ? '' : ` next ${plain(retry.nextAt)}`;

  return ` attempt ${retry.attempt}${maximum}${next}`;
}

/** Creates a structured, bounded command-history render model. */
export function renderCommandLogModel<TItem extends CommandLogItem>({
  activeId,
  characters = COMMAND_LOG_UNICODE_CHARACTERS,
  height,
  items,
  newestFirst = false,
  width,
}: RenderCommandLogOptions<TItem>): CommandLogRenderResult {
  assertPlainDimensions({ height, width }, 'CommandLog');
  items.forEach(assertItem);

  const ordered = newestFirst ? [...items].reverse() : [...items];
  const visible = height === undefined ? ordered : ordered.slice(0, height);
  const lines = visible.map((item) => {
    const marker = item.id === activeId ? characters.active : characters.inactive;
    const timestamp = item.timestamp === undefined ? '' : `${plain(item.timestamp)} `;
    const exitCode = item.exitCode === undefined ? '' : ` exit ${item.exitCode}`;
    const duration = item.duration === undefined ? '' : ` ${plain(item.duration)}`;
    const retry = renderRetry(item.retry);
    const action = item.retryable ? ` ${plain(characters.retry)}` : '';

    return fitPlain(
      `${marker} ${timestamp}${item.status.toUpperCase()} ${plain(item.command)}${duration}${exitCode}${retry}${action}`,
      width,
    );
  });

  return { content: lines.join('\n'), visibleItemIds: visible.map(({ id }) => id) };
}

/** Renders structured command execution history. Does not execute or retry commands. */
export function renderCommandLog<TItem extends CommandLogItem>(
  options: RenderCommandLogOptions<TItem>,
): string {
  return renderCommandLogModel(options).content;
}
