import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** One active filter displayed by a FilterBar. */
export interface FilterBarFilter {
  /** Stable filter identifier. */
  id: string;
  /** Human-readable filter name. */
  label: string;
  /** Whether this filter cannot be removed. */
  removable?: boolean;
  /** Human-readable current filter value. */
  value: string;
}

/** Focusable FilterBar target. */
export type FilterBarTarget = 'clear' | 'reset' | `filter:${string}`;

/** Character tokens used by {@link renderFilterBar}. */
export interface FilterBarCharacters {
  activeLeft: string;
  activeRight: string;
  clear: string;
  filterLeft: string;
  filterRight: string;
  overflow: string;
  query: string;
  remove: string;
  separator: string;
}

export const FILTER_BAR_UNICODE_CHARACTERS: Readonly<FilterBarCharacters> = Object.freeze({
  activeLeft: '▸',
  activeRight: '◂',
  clear: 'Clear',
  filterLeft: '[',
  filterRight: ']',
  overflow: '…',
  query: '/',
  remove: '×',
  separator: '│',
});

export const FILTER_BAR_ASCII_CHARACTERS: Readonly<FilterBarCharacters> = Object.freeze({
  activeLeft: '>',
  activeRight: '<',
  clear: 'Clear',
  filterLeft: '[',
  filterRight: ']',
  overflow: '...',
  query: '/',
  remove: 'x',
  separator: '|',
});

/** Options accepted by {@link renderFilterBar}. */
export interface RenderFilterBarOptions {
  activeTarget?: FilterBarTarget;
  characters?: FilterBarCharacters;
  /** Ordered active filters. */
  filters?: readonly FilterBarFilter[];
  /** Optional compact result metadata. */
  resultCount?: number;
  /** Current query text. */
  query?: string;
  /** Whether output is padded to `width`. */
  pad?: boolean;
  /** Whether the reset control is shown. */
  showReset?: boolean;
  /** Available terminal-cell width. */
  width: number;
}

/** FilterBar layout result used by adapters for hit testing. */
export interface FilterBarRenderResult {
  content: string;
  visibleTargets: readonly FilterBarTarget[];
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value))
    .replace(/[\r\n]+/gu, ' ')
    .trim();
}

function focused(
  value: string,
  target: FilterBarTarget,
  active: FilterBarTarget | undefined,
  c: FilterBarCharacters,
): string {
  return target === active ? `${c.activeLeft}${value}${c.activeRight}` : value;
}

/** Lays out query state, filters, result count, and reset actions in one line. */
export function renderFilterBarModel({
  activeTarget,
  characters = FILTER_BAR_UNICODE_CHARACTERS,
  filters = [],
  pad = false,
  query,
  resultCount,
  showReset = false,
  width,
}: RenderFilterBarOptions): FilterBarRenderResult {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('FilterBar width must be a non-negative integer.');
  }

  if (resultCount !== undefined && (!Number.isInteger(resultCount) || resultCount < 0)) {
    throw new RangeError('FilterBar resultCount must be a non-negative integer.');
  }

  const ids = new Set<string>();

  for (const filter of filters) {
    if (
      plainText(filter.id).length === 0 ||
      plainText(filter.label).length === 0 ||
      plainText(filter.value).length === 0
    ) {
      throw new RangeError('FilterBar filter ids, labels, and values must be non-empty.');
    }

    if (ids.has(filter.id)) {
      throw new RangeError(`FilterBar filter ids must be unique: ${filter.id}.`);
    }

    ids.add(filter.id);
  }

  if (width === 0) {
    return { content: '', visibleTargets: [] };
  }

  const segments: Array<{ target?: FilterBarTarget; text: string }> = [];
  const safeQuery = query === undefined ? '' : plainText(query);

  if (safeQuery.length > 0) {
    segments.push({ text: `${characters.query} ${safeQuery}` });
  }

  for (const filter of filters) {
    const target: FilterBarTarget = `filter:${filter.id}`;
    const remove = filter.removable === false ? '' : ` ${characters.remove}`;
    const value = `${characters.filterLeft}${plainText(filter.label)}: ${plainText(filter.value)}${remove}${characters.filterRight}`;

    segments.push({ target, text: focused(value, target, activeTarget, characters) });
  }

  if (resultCount !== undefined) {
    segments.push({ text: `${resultCount} ${resultCount === 1 ? 'result' : 'results'}` });
  }

  if (filters.some(({ removable }) => removable !== false) || safeQuery.length > 0) {
    segments.push({
      target: 'clear',
      text: focused(characters.clear, 'clear', activeTarget, characters),
    });
  }

  if (showReset) {
    segments.push({ target: 'reset', text: focused('Reset', 'reset', activeTarget, characters) });
  }

  const separator = ` ${characters.separator} `;
  const visibleTargets: FilterBarTarget[] = [];

  let content = '';

  for (const [index, segment] of segments.entries()) {
    const prefix = index === 0 || content.length === 0 ? '' : separator;
    const remaining = segments.length - index - 1;
    const reserve = remaining > 0 ? visibleWidth(` ${characters.overflow}`) : 0;

    if (
      visibleWidth(content) + visibleWidth(prefix) + visibleWidth(segment.text) + reserve >
      width
    ) {
      break;
    }

    content += `${prefix}${segment.text}`;

    if (segment.target !== undefined) {
      visibleTargets.push(segment.target);
    }
  }

  if (
    visibleTargets.length < segments.filter(({ target }) => target !== undefined).length ||
    visibleWidth(content) <
      segments.map(({ text }) => text).reduce((total, text) => total + visibleWidth(text), 0)
  ) {
    content = truncateText(
      `${content}${content.length > 0 ? ' ' : ''}${characters.overflow}`,
      width,
    );
  }

  if (pad) {
    content += ' '.repeat(Math.max(0, width - visibleWidth(content)));
  }

  return { content, visibleTargets };
}

/** Renders a compact one-line summary of active filtering state. */
export function renderFilterBar(options: RenderFilterBarOptions): string {
  return renderFilterBarModel(options).content;
}
