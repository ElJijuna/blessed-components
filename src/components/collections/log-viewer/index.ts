import { formatDateTime } from '@/core/format.js';
import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Severity or category for one log entry. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** Structured log entry accepted by LogViewer. */
export interface LogEntry {
  /** Stable entry id. */
  id: string;

  /** Log severity. */
  level?: LogLevel;

  /** Log message. ANSI sequences and Blessed tags are stripped. */
  message: string;

  /** Optional source, subsystem, or logger name. */
  source?: string;

  /** Entry timestamp. */
  timestamp?: Date | number | string;
}

/** Character tokens used by {@link renderLogViewer}. */
export interface LogViewerCharacters {
  /** Debug level marker. */
  debug: string;

  /** Error level marker. */
  error: string;

  /** Info level marker. */
  info: string;

  /** Marker shown before each row. */
  prefix: string;

  /** Warning level marker. */
  warn: string;
}

/** Options accepted by {@link renderLogViewer}. */
export interface RenderLogViewerOptions {
  /** Character tokens for row structure and level state. */
  characters?: LogViewerCharacters;

  /** Text displayed when no entries exist. */
  emptyText?: string;

  /** Maximum number of rendered rows. */
  height: number;

  /** Entries to render. Caller-owned data is never mutated. */
  entries: readonly LogEntry[];

  /** First rendered entry index. */
  offset?: number;

  /** Whether to include level markers. @defaultValue `true` */
  showLevel?: boolean;

  /** Whether to include source text. @defaultValue `true` */
  showSource?: boolean;

  /** Whether to include timestamps. @defaultValue `false` */
  showTimestamp?: boolean;

  /** Maximum terminal-cell width of each row. */
  width: number;
}

/** Options accepted by {@link createLogViewerState}. */
export interface CreateLogViewerStateOptions {
  /** Whether append operations are queued instead of displayed. */
  defaultPaused?: boolean;

  /** Initial visible entries. */
  entries?: readonly LogEntry[];

  /** Whether visible offset follows appended entries. @defaultValue `true` */
  follow?: boolean;

  /** Maximum retained visible entries. @defaultValue `1000` */
  maxEntries?: number;
}

/** Headless LogViewer state model. */
export interface LogViewerStateModel {
  /** Appends one entry, or queues it while paused. */
  append(entry: LogEntry): LogEntry[];

  /** Appends multiple entries, or queues them while paused. */
  appendMany(entries: readonly LogEntry[]): LogEntry[];

  /** Clears visible and queued entries. */
  clear(): void;

  /** Returns retained visible entries. */
  entries(): readonly LogEntry[];

  /** Returns whether append operations are queued. */
  isPaused(): boolean;

  /** Returns queued entries not yet visible. */
  pendingEntries(): readonly LogEntry[];

  /** Starts queueing appended entries. */
  pause(): void;

  /** Flushes queued entries and returns visible entries. */
  resume(): readonly LogEntry[];

  /** Replaces options while preserving visible entries. */
  setOptions(options: CreateLogViewerStateOptions): void;
}

const DEFAULT_CHARACTERS: LogViewerCharacters = {
  debug: '·',
  error: '!',
  info: 'i',
  prefix: '│',
  warn: '▲',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function assertDimensions(height: number, width: number, offset: number): void {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('LogViewer dimensions and offset must be non-negative integers.');
  }
}

function retained(entries: readonly LogEntry[], maxEntries: number): LogEntry[] {
  return entries.slice(Math.max(0, entries.length - maxEntries));
}

function safeMaxEntries(maxEntries: number | undefined): number {
  if (maxEntries !== undefined && (!Number.isInteger(maxEntries) || maxEntries < 1)) {
    throw new RangeError('LogViewer maxEntries must be a positive integer.');
  }

  return maxEntries ?? 1000;
}

function renderEntry({
  characters,
  entry,
  showLevel,
  showSource,
  showTimestamp,
  width,
}: {
  characters: LogViewerCharacters;
  entry: LogEntry;
  showLevel: boolean;
  showSource: boolean;
  showTimestamp: boolean;
  width: number;
}): string {
  const parts = [characters.prefix];

  if (showTimestamp && entry.timestamp !== undefined) {
    parts.push(formatDateTime(entry.timestamp));
  }

  if (showLevel) {
    parts.push(characters[entry.level ?? 'info']);
  }

  if (showSource && entry.source !== undefined) {
    parts.push(`[${plainText(entry.source)}]`);
  }

  parts.push(plainText(entry.message));

  return truncateText(parts.join(' '), width);
}

/** Renders a bounded, terminal-cell-aware log viewport. */
export function renderLogViewer({
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No log entries',
  entries,
  height,
  offset = 0,
  showLevel = true,
  showSource = true,
  showTimestamp = false,
  width,
}: RenderLogViewerOptions): string {
  assertDimensions(height, width, offset);

  if (height === 0) {
    return '';
  }

  if (entries.length === 0) {
    return truncateText(emptyText, width);
  }

  return entries
    .slice(offset, offset + height)
    .map((entry) =>
      renderEntry({
        characters,
        entry,
        showLevel,
        showSource,
        showTimestamp,
        width,
      }),
    )
    .join('\n');
}

/** Creates a retained, pausable log buffer for streaming terminal output. */
export function createLogViewerState(
  initialOptions: CreateLogViewerStateOptions = {},
): LogViewerStateModel {
  let options = initialOptions;
  let maxEntries = safeMaxEntries(options.maxEntries);
  let visibleEntries = retained(options.entries ?? [], maxEntries);
  let pendingEntries: LogEntry[] = [];
  let paused = initialOptions.defaultPaused ?? false;

  const appendVisible = (entries: readonly LogEntry[]): LogEntry[] => {
    visibleEntries = retained([...visibleEntries, ...entries], maxEntries);

    return visibleEntries;
  };

  return {
    append(entry) {
      return this.appendMany([entry]);
    },
    appendMany(entries) {
      if (paused) {
        pendingEntries = retained([...pendingEntries, ...entries], maxEntries);

        return visibleEntries;
      }

      return appendVisible(entries);
    },
    clear() {
      visibleEntries = [];
      pendingEntries = [];
    },
    entries() {
      return visibleEntries;
    },
    isPaused() {
      return paused;
    },
    pause() {
      paused = true;
    },
    pendingEntries() {
      return pendingEntries;
    },
    resume() {
      paused = false;
      appendVisible(pendingEntries);
      pendingEntries = [];

      return visibleEntries;
    },
    setOptions(nextOptions) {
      options = nextOptions;
      maxEntries = safeMaxEntries(options.maxEntries);
      visibleEntries = retained(nextOptions.entries ?? visibleEntries, maxEntries);
      pendingEntries = retained(pendingEntries, maxEntries);

      if (nextOptions.defaultPaused !== undefined) {
        paused = nextOptions.defaultPaused;
      }
    },
  };
}
