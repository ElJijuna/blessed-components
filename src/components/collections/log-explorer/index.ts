import {
  type LogEntry,
  type LogLevel,
  type LogViewerCharacters,
  renderLogViewer,
} from '@/components/collections/log-viewer/index.js';
import { stripBlessedTags } from '@/core/tags.js';
import { stripAnsi } from '@/core/width.js';

/** Search and facet filters applied by LogExplorer. */
export interface LogExplorerFilter {
  /** Whether query matching preserves case. @defaultValue `false` */
  caseSensitive?: boolean;

  /** Included log levels. Empty or omitted arrays include every level. */
  levels?: readonly LogLevel[];

  /** Text query matched against message, source, and level. */
  query?: string;

  /** Included sources. Empty or omitted arrays include every source. */
  sources?: readonly string[];
}

/** Options accepted by {@link filterLogExplorerEntries}. */
export interface FilterLogExplorerEntriesOptions {
  /** Entries to filter. Caller-owned data is never mutated. */
  entries: readonly LogEntry[];

  /** Search and facet filters. */
  filter?: LogExplorerFilter;
}

/** Options accepted by {@link renderLogExplorer}. */
export interface RenderLogExplorerOptions extends FilterLogExplorerEntriesOptions {
  /** Character tokens for row structure and level state. */
  characters?: LogViewerCharacters;

  /** Text displayed when no entries exist before filtering. */
  emptyText?: string;

  /** Maximum number of rendered rows. */
  height: number;

  /** Text displayed when filters hide all entries. */
  noMatchesText?: string;

  /** First rendered filtered entry index. */
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

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function normalized(value: string, caseSensitive: boolean): string {
  const plain = plainText(value);

  return caseSensitive ? plain : plain.toLocaleLowerCase();
}

function hasValues<TValue>(values: readonly TValue[] | undefined): values is readonly TValue[] {
  return values !== undefined && values.length > 0;
}

/** Filters log entries by text query, level, and source facets. */
export function filterLogExplorerEntries({
  entries,
  filter = {},
}: FilterLogExplorerEntriesOptions): readonly LogEntry[] {
  const caseSensitive = filter.caseSensitive ?? false;
  const query =
    filter.query === undefined || filter.query.length === 0
      ? undefined
      : normalized(filter.query, caseSensitive);
  const levels = hasValues(filter.levels) ? new Set(filter.levels) : undefined;
  const sources = hasValues(filter.sources)
    ? new Set(filter.sources.map((source) => plainText(source)))
    : undefined;

  return entries.filter((entry) => {
    const level = entry.level ?? 'info';

    if (levels !== undefined && !levels.has(level)) {
      return false;
    }

    if (
      sources !== undefined &&
      (entry.source === undefined || !sources.has(plainText(entry.source)))
    ) {
      return false;
    }

    if (query === undefined) {
      return true;
    }

    const searchable = [entry.message, entry.source ?? '', level]
      .map((part) => normalized(part, caseSensitive))
      .join(' ');

    return searchable.includes(query);
  });
}

/** Renders a bounded, filtered log viewport. */
export function renderLogExplorer({
  characters,
  emptyText = 'No log entries',
  entries,
  filter,
  height,
  noMatchesText = 'No matching log entries',
  offset = 0,
  showLevel,
  showSource,
  showTimestamp,
  width,
}: RenderLogExplorerOptions): string {
  const filteredEntries = filterLogExplorerEntries({
    entries,
    ...(filter === undefined ? {} : { filter }),
  });

  return renderLogViewer({
    ...(characters === undefined ? {} : { characters }),
    emptyText: entries.length === 0 ? emptyText : noMatchesText,
    entries: filteredEntries,
    height,
    offset,
    ...(showLevel === undefined ? {} : { showLevel }),
    ...(showSource === undefined ? {} : { showSource }),
    ...(showTimestamp === undefined ? {} : { showTimestamp }),
    width,
  });
}
