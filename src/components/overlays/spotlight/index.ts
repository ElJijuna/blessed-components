import type { MenuItem } from '@/components/navigation/menu/index.js';
import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Minimum data required for one Spotlight result. */
export interface SpotlightItem extends MenuItem {
  /** Additional searchable terms. */
  keywords?: readonly string[];
}

/** Options accepted by {@link createSpotlightState}. */
export interface CreateSpotlightStateOptions {
  /** Initial state for uncontrolled usage. @defaultValue `false` */
  defaultOpen?: boolean;

  /** Initial query for uncontrolled usage. @defaultValue `''` */
  defaultQuery?: string;

  /** Called when Spotlight requests an open-state change. */
  onOpenChange?: (open: boolean) => void;

  /** Called when Spotlight query changes. */
  onQueryChange?: (query: string) => void;

  /** Controlled open state. */
  open?: boolean;

  /** Controlled query text. */
  query?: string;
}

/** Controlled or uncontrolled Spotlight open/query state model. */
export interface SpotlightStateModel {
  /** Requests closing and returns resulting observable open state. */
  close(): boolean;

  /** Returns current controlled or uncontrolled open state. */
  isOpen(): boolean;

  /** Requests opening and returns resulting observable open state. */
  open(): boolean;

  /** Returns current controlled or uncontrolled query. */
  query(): string;

  /** Replaces controlled/uncontrolled options. */
  setOptions(options: CreateSpotlightStateOptions): void;

  /** Requests a query change and returns resulting observable query. */
  setQuery(query: string): string;

  /** Requests opposite open state and returns resulting observable open state. */
  toggle(): boolean;
}

/** Options accepted by {@link filterSpotlightItems}. */
export interface FilterSpotlightItemsOptions<TItem extends SpotlightItem = SpotlightItem> {
  /** Ordered source items. Caller-owned data is never mutated. */
  items: readonly TItem[];

  /** Maximum returned results. */
  limit?: number;

  /** Search query. Whitespace is trimmed and matching is case-insensitive. */
  query?: string;
}

/** Options accepted by {@link renderSpotlightStatus}. */
export interface RenderSpotlightStatusOptions {
  /** Visible result count. */
  count: number;

  /** Current search query. */
  query?: string;

  /** Total candidate count before filtering. */
  total: number;

  /** Maximum terminal-cell width. */
  width: number;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function normalize(value: string): string {
  return plainText(value).toLocaleLowerCase();
}

function searchableText(item: SpotlightItem): string {
  return [
    item.id,
    item.label,
    item.shortcut ?? '',
    ...(item.keywords?.map((keyword) => keyword) ?? []),
  ]
    .map(plainText)
    .join(' ');
}

/** Creates controlled or uncontrolled Spotlight open and query state. */
export function createSpotlightState(
  initialOptions: CreateSpotlightStateOptions = {},
): SpotlightStateModel {
  let options = initialOptions;
  let uncontrolledOpen = initialOptions.defaultOpen ?? false;
  let uncontrolledQuery = initialOptions.defaultQuery ?? '';

  const isOpenControlled = (): boolean => Object.hasOwn(options, 'open');
  const isQueryControlled = (): boolean => Object.hasOwn(options, 'query');
  const isOpen = (): boolean => (isOpenControlled() ? (options.open ?? false) : uncontrolledOpen);
  const query = (): string => (isQueryControlled() ? (options.query ?? '') : uncontrolledQuery);
  const requestOpen = (nextOpen: boolean): boolean => {
    if (nextOpen === isOpen()) {
      return isOpen();
    }

    if (!isOpenControlled()) {
      uncontrolledOpen = nextOpen;
    }

    options.onOpenChange?.(nextOpen);

    return isOpen();
  };
  const requestQuery = (nextQuery: string): string => {
    const normalizedQuery = plainText(nextQuery);

    if (normalizedQuery === query()) {
      return query();
    }

    if (!isQueryControlled()) {
      uncontrolledQuery = normalizedQuery;
    }

    options.onQueryChange?.(normalizedQuery);

    return query();
  };

  return {
    close: () => requestOpen(false),
    isOpen,
    open: () => requestOpen(true),
    query,
    setOptions(nextOptions) {
      const previousOpen = isOpen();
      const previousQuery = query();
      const wasOpenControlled = isOpenControlled();
      const wasQueryControlled = isQueryControlled();

      options = nextOptions;

      if (wasOpenControlled && !isOpenControlled()) {
        uncontrolledOpen = previousOpen;
      }

      if (wasQueryControlled && !isQueryControlled()) {
        uncontrolledQuery = previousQuery;
      }
    },
    setQuery: requestQuery,
    toggle: () => requestOpen(!isOpen()),
  };
}

/** Filters Spotlight items by id, label, shortcut, and keywords. */
export function filterSpotlightItems<TItem extends SpotlightItem>({
  items,
  limit,
  query = '',
}: FilterSpotlightItemsOptions<TItem>): TItem[] {
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 0)) {
    throw new RangeError('Spotlight result limit must be a non-negative integer.');
  }

  const normalizedQuery = normalize(query).trim();
  const results =
    normalizedQuery.length === 0
      ? [...items]
      : items.filter((item) => normalize(searchableText(item)).includes(normalizedQuery));

  return limit === undefined ? results : results.slice(0, limit);
}

/** Renders a compact Spotlight result count/status line. */
export function renderSpotlightStatus({
  count,
  query = '',
  total,
  width,
}: RenderSpotlightStatusOptions): string {
  if (
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(count) ||
    count < 0 ||
    !Number.isInteger(total) ||
    total < 0
  ) {
    throw new RangeError('Spotlight status dimensions and counts must be non-negative integers.');
  }

  const normalizedQuery = plainText(query).trim();
  const text =
    normalizedQuery.length === 0
      ? `${total} actions`
      : `${count} of ${total} actions for "${normalizedQuery}"`;

  return truncateText(text, width);
}
