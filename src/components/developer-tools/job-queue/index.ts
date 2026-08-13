import { assertPlainDimensions, fitPlain, plain } from '@/components/shared/text.js';

/** Lifecycle state of a background job. */
export type JobQueueStatus = 'cancelled' | 'failed' | 'queued' | 'running' | 'succeeded';

/** Retry information associated with a background job. */
export interface JobQueueRetry {
  /** One-based execution attempt. */
  attempt: number;
  /** Maximum number of attempts, when bounded. */
  maxAttempts?: number;
  /** Human-readable time at which the next retry is scheduled. */
  nextAt?: string;
}

/** One job displayed by JobQueue. */
export interface JobQueueItem {
  /** Whether the caller currently permits cancellation. */
  cancellable?: boolean;
  /** Optional secondary status text. */
  detail?: string;
  /** Stable job identifier. */
  id: string;
  /** Human-readable job label. */
  label: string;
  /** Completion percentage from 0 through 100. */
  progress?: number;
  /** Retry attempt and schedule metadata. */
  retry?: JobQueueRetry;
  /** Whether the caller currently permits a retry. */
  retryable?: boolean;
  /** Current lifecycle state. */
  status: JobQueueStatus;
}

/** Character tokens used by {@link renderJobQueue}. */
export interface JobQueueCharacters {
  active: string;
  cancel: string;
  inactive: string;
  retry: string;
}

export const JOB_QUEUE_UNICODE_CHARACTERS: Readonly<JobQueueCharacters> = Object.freeze({
  active: '▸',
  cancel: '×',
  inactive: ' ',
  retry: '↻',
});

export const JOB_QUEUE_ASCII_CHARACTERS: Readonly<JobQueueCharacters> = Object.freeze({
  active: '>',
  cancel: 'cancel',
  inactive: ' ',
  retry: 'retry',
});

/** Options accepted by {@link renderJobQueue}. */
export interface RenderJobQueueOptions<TItem extends JobQueueItem = JobQueueItem> {
  activeId?: string;
  characters?: JobQueueCharacters;
  height?: number;
  items: readonly TItem[];
  /** Display jobs in reverse input order without mutating `items`. */
  newestFirst?: boolean;
  /** Include the aggregate status line. Defaults to true. */
  summary?: boolean;
  width?: number;
}

/** Rendered queue content and the job ids visible after clipping. */
export interface JobQueueRenderResult {
  content: string;
  visibleItemIds: readonly string[];
}

const statuses: readonly JobQueueStatus[] = [
  'queued',
  'running',
  'succeeded',
  'failed',
  'cancelled',
];

function assertItem(item: JobQueueItem): void {
  if (plain(item.id).trim().length === 0 || plain(item.label).trim().length === 0) {
    throw new RangeError('JobQueue item ids and labels must be non-empty.');
  }

  if (
    item.progress !== undefined &&
    (!Number.isFinite(item.progress) || item.progress < 0 || item.progress > 100)
  ) {
    throw new RangeError('JobQueue progress must be between 0 and 100.');
  }

  if (
    item.retry !== undefined &&
    (!Number.isInteger(item.retry.attempt) ||
      item.retry.attempt < 1 ||
      (item.retry.maxAttempts !== undefined &&
        (!Number.isInteger(item.retry.maxAttempts) || item.retry.maxAttempts < item.retry.attempt)))
  ) {
    throw new RangeError('JobQueue retry attempts must be positive and within maxAttempts.');
  }
}

function renderSummary(items: readonly JobQueueItem[]): string {
  const counts = new Map<JobQueueStatus, number>();

  for (const item of items) {
    counts.set(item.status, (counts.get(item.status) ?? 0) + 1);
  }

  const breakdown = statuses
    .map((status) => [status, counts.get(status) ?? 0] as const)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => `${status} ${count}`)
    .join(' · ');

  return `Jobs ${items.length}${breakdown.length === 0 ? '' : ` · ${breakdown}`}`;
}

function renderRetry(retry: JobQueueRetry | undefined): string {
  if (retry === undefined) {
    return '';
  }

  const maximum = retry.maxAttempts === undefined ? '' : `/${retry.maxAttempts}`;
  const next = retry.nextAt === undefined ? '' : ` next ${plain(retry.nextAt)}`;

  return ` attempt ${retry.attempt}${maximum}${next}`;
}

/** Creates a bounded, terminal-safe job queue render model. */
export function renderJobQueueModel<TItem extends JobQueueItem>({
  activeId,
  characters = JOB_QUEUE_UNICODE_CHARACTERS,
  height,
  items,
  newestFirst = false,
  summary = true,
  width,
}: RenderJobQueueOptions<TItem>): JobQueueRenderResult {
  assertPlainDimensions({ height, width }, 'JobQueue');
  items.forEach(assertItem);

  const ids = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id)) {
      throw new RangeError('JobQueue item ids must be unique.');
    }

    ids.add(item.id);
  }

  const ordered = newestFirst ? [...items].reverse() : [...items];
  const rowLimit = height === undefined ? undefined : Math.max(0, height - (summary ? 1 : 0));
  const visible = rowLimit === undefined ? ordered : ordered.slice(0, rowLimit);
  const lines = visible.map((item) => {
    const marker = item.id === activeId ? characters.active : characters.inactive;
    const progress = item.progress === undefined ? '' : ` ${Math.round(item.progress)}%`;
    const detail = item.detail === undefined ? '' : ` - ${plain(item.detail)}`;
    const retry = renderRetry(item.retry);
    const actions = [
      item.cancellable ? plain(characters.cancel) : '',
      item.retryable ? plain(characters.retry) : '',
    ].filter(Boolean);
    const actionText = actions.length === 0 ? '' : ` [${actions.join('/')}]`;

    return fitPlain(
      `${marker} ${item.status.toUpperCase()} ${plain(item.label)}${progress}${detail}${retry}${actionText}`,
      width,
    );
  });

  if (summary && (height === undefined || height > 0)) {
    lines.unshift(fitPlain(renderSummary(items), width));
  }

  return { content: lines.join('\n'), visibleItemIds: visible.map(({ id }) => id) };
}

/** Renders a background-job queue. It never starts, cancels, or retries jobs itself. */
export function renderJobQueue<TItem extends JobQueueItem>(
  options: RenderJobQueueOptions<TItem>,
): string {
  return renderJobQueueModel(options).content;
}
