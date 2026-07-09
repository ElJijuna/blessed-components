import { renderPlainLines } from '@/components/shared/text.js';

/** Lifecycle state displayed by TerminalPane. */
export type TerminalPaneStatus = 'failed' | 'idle' | 'running' | 'succeeded';

/** Safe command metadata displayed by TerminalPane. It is never executed. */
export interface TerminalPaneCommand {
  /** Executable or command label. */
  command: string;

  /** Displayed arguments. */
  args?: readonly string[];

  /** Displayed working directory. */
  cwd?: string;
}

/** One captured terminal output line. */
export interface TerminalPaneLine {
  /** Output stream marker. */
  stream?: 'stderr' | 'stdout' | 'system';

  /** Terminal text. ANSI sequences and Blessed tags are removed. */
  text: string;
}

/** Options accepted by {@link renderTerminalPane}. */
export interface RenderTerminalPaneOptions {
  /** Command metadata displayed in the header. */
  command?: TerminalPaneCommand;

  /** Text displayed when no output exists. */
  emptyText?: string;

  /** Exit code when the session completed. */
  exitCode?: number;

  /** Maximum rendered height. */
  height?: number;

  /** Output lines. */
  lines?: readonly TerminalPaneLine[];

  /** First output row to render after the header. */
  offset?: number;

  /** Whether to render the command/status header. @defaultValue `true` */
  showHeader?: boolean;

  /** Current lifecycle status. */
  status?: TerminalPaneStatus;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

function assertNonNegativeInteger(value: number | undefined, name: string): void {
  if (value === undefined) {
    return;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`TerminalPane ${name} must be a non-negative integer.`);
  }
}

/** Formats command metadata as a safe, display-only shell prompt. */
export function formatTerminalPaneCommand(command: TerminalPaneCommand | undefined): string {
  if (command === undefined) {
    return '$';
  }

  return ['$', command.command, ...(command.args ?? [])].join(' ');
}

function formatStatus(status: TerminalPaneStatus, exitCode: number | undefined): string {
  if (exitCode === undefined) {
    return `[${status}]`;
  }

  return `[${status} ${exitCode}]`;
}

function formatLine(line: TerminalPaneLine): string {
  const marker = line.stream === 'stderr' ? 'err' : line.stream === 'system' ? 'sys' : 'out';

  return `${marker} │ ${line.text}`;
}

/** Renders a scrollable, display-only terminal session pane. Does not spawn processes. */
export function renderTerminalPane({
  command,
  emptyText = 'No terminal output',
  exitCode,
  height,
  lines = [],
  offset = 0,
  showHeader = true,
  status = 'idle',
  width,
}: RenderTerminalPaneOptions): string {
  assertNonNegativeInteger(height, 'height');
  assertNonNegativeInteger(offset, 'offset');
  assertNonNegativeInteger(width, 'width');

  const viewportHeight =
    height === undefined ? undefined : Math.max(0, height - (showHeader ? 1 : 0));
  const body = lines.length === 0 ? [emptyText] : lines.slice(offset).map(formatLine);
  const visibleBody = viewportHeight === undefined ? body : body.slice(0, viewportHeight);
  const output = showHeader
    ? [`${formatTerminalPaneCommand(command)} ${formatStatus(status, exitCode)}`, ...visibleBody]
    : visibleBody;

  return renderPlainLines(output, { height, width });
}
