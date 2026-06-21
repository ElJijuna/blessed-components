import { truncateText } from '../../../core/truncate.js';

/**
 * Minimum data required for one List row.
 *
 * Applications may extend this shape with metadata consumed by adapters or
 * custom item formatters.
 */
export interface ListItem {
  /** Whether navigation and selection must skip this item. */
  disabled?: boolean;

  /** Stable identifier used for cursor and selection state. */
  id: string;

  /** Human-readable row content. */
  label: string;
}

/**
 * Character tokens used by {@link renderList}.
 */
export interface ListCharacters {
  /** Marker shown beside the active row. */
  active: string;

  /** Marker shown beside a disabled row. */
  disabled: string;

  /** Marker shown beside an enabled unselected row. */
  idle: string;

  /** Marker shown beside the selected row. */
  selected: string;
}

/**
 * Options accepted by {@link renderList}.
 *
 * @typeParam TItem - List item shape, including optional application metadata.
 */
export interface RenderListOptions<TItem extends ListItem = ListItem> {
  /** Identifier receiving the visible cursor marker. */
  activeId?: string;

  /** Character tokens used to communicate row state without color. */
  characters?: ListCharacters;

  /**
   * Text returned when `items` is empty.
   *
   * @defaultValue `'No items'`
   */
  emptyText?: string;

  /** Maximum number of rendered rows. */
  height: number;

  /** Ordered list items. Caller-owned data is never mutated. */
  items: readonly TItem[];

  /**
   * First rendered item index.
   *
   * @defaultValue `0`
   */
  offset?: number;

  /** Identifier receiving the selected marker. */
  selectedId?: string;

  /** Maximum terminal-cell width of each row. */
  width: number;
}

const DEFAULT_CHARACTERS: ListCharacters = {
  active: '›',
  disabled: '×',
  idle: ' ',
  selected: '●',
};

/**
 * Renders a bounded, terminal-cell-aware list viewport.
 *
 * Active, selected, and disabled states use text markers so they remain
 * understandable without terminal color. This renderer is deterministic and
 * does not import Blessed or retain interaction state.
 *
 * @typeParam TItem - List item shape.
 * @param options - Items, state identifiers, dimensions, and characters.
 * @returns Plain text containing at most `height` rows.
 *
 * @throws `RangeError`
 * Thrown when dimensions or offset are not non-negative integers.
 *
 * @example
 *
 * ```ts
 * renderList({
 *   activeId: 'build',
 *   height: 3,
 *   items: [
 *     { id: 'test', label: 'Run tests' },
 *     { id: 'build', label: 'Build package' },
 *   ],
 *   selectedId: 'test',
 *   width: 24,
 * });
 * ```
 */
export function renderList<TItem extends ListItem>({
  activeId,
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No items',
  height,
  items,
  offset = 0,
  selectedId,
  width,
}: RenderListOptions<TItem>): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('List dimensions and offset must be non-negative integers.');
  }

  if (items.length === 0) {
    return truncateText(emptyText, width);
  }

  return items
    .slice(offset, offset + height)
    .map((item) => {
      const cursor = item.id === activeId ? characters.active : ' ';
      const state =
        item.disabled === true
          ? characters.disabled
          : item.id === selectedId
            ? characters.selected
            : characters.idle;

      return truncateText(`${cursor} ${state} ${item.label}`, width);
    })
    .join('\n');
}
