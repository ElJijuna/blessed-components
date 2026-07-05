import type { ListCharacters, ListItem } from '@/components/collections/list/index.js';
import { truncateText } from '@/core/truncate.js';

/** Item accepted by GroupedList sections. */
export type GroupedListItem = ListItem;

/** One visible GroupedList section. */
export interface GroupedListSection<TItem extends GroupedListItem = GroupedListItem> {
  /** Stable section identifier. */
  id: string;

  /** Ordered section items. */
  items: readonly TItem[];

  /** Human-readable section heading. */
  title: string;
}

/** Flattened row produced by {@link flattenGroupedListRows}. */
export type GroupedListRow<TItem extends GroupedListItem = GroupedListItem> =
  | {
      id: string;
      sectionId: string;
      title: string;
      type: 'header';
    }
  | {
      item: TItem;
      sectionId: string;
      type: 'item';
    };

/** Character tokens used by {@link renderGroupedList}. */
export interface GroupedListCharacters extends ListCharacters {
  /** Marker shown beside section headings. */
  header: string;
}

/** Options accepted by {@link flattenGroupedListRows}. */
export interface FlattenGroupedListRowsOptions<TItem extends GroupedListItem = GroupedListItem> {
  /** Ordered sections. Caller-owned data is never mutated. */
  sections: readonly GroupedListSection<TItem>[];
}

/** Options accepted by {@link renderGroupedList}. */
export interface RenderGroupedListOptions<TItem extends GroupedListItem = GroupedListItem>
  extends FlattenGroupedListRowsOptions<TItem> {
  /** Identifier receiving the visible cursor marker. */
  activeId?: string;

  /** Character tokens used to communicate row state without color. */
  characters?: GroupedListCharacters;

  /**
   * Text returned when there are no visible rows.
   *
   * @defaultValue `'No items'`
   */
  emptyText?: string;

  /** Maximum number of rendered rows. */
  height: number;

  /** Spaces inserted before item rows. @defaultValue `2` */
  indent?: number;

  /** First rendered row index. @defaultValue `0` */
  offset?: number;

  /** Identifier receiving the selected marker. */
  selectedId?: string;

  /** Maximum terminal-cell width of each row. */
  width: number;
}

const DEFAULT_CHARACTERS: GroupedListCharacters = {
  active: '›',
  disabled: '×',
  header: '▪',
  idle: ' ',
  selected: '●',
};

function assertDimensions(height: number, width: number, offset: number, indent: number): void {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    !Number.isInteger(indent) ||
    indent < 0
  ) {
    throw new RangeError(
      'GroupedList dimensions, offset, and indent must be non-negative integers.',
    );
  }
}

/** Flattens grouped sections into header and item rows. */
export function flattenGroupedListRows<TItem extends GroupedListItem>({
  sections,
}: FlattenGroupedListRowsOptions<TItem>): readonly GroupedListRow<TItem>[] {
  return sections.flatMap((section) => [
    {
      id: `section:${section.id}`,
      sectionId: section.id,
      title: section.title,
      type: 'header' as const,
    },
    ...section.items.map((item) => ({
      item,
      sectionId: section.id,
      type: 'item' as const,
    })),
  ]);
}

/**
 * Renders a bounded grouped list viewport.
 *
 * Section headings are visible but not selectable. Item rows preserve the List
 * active, selected, and disabled marker contract.
 */
export function renderGroupedList<TItem extends GroupedListItem>({
  activeId,
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No items',
  height,
  indent = 2,
  offset = 0,
  sections,
  selectedId,
  width,
}: RenderGroupedListOptions<TItem>): string {
  assertDimensions(height, width, offset, indent);

  const rows = flattenGroupedListRows({ sections });

  if (height === 0) {
    return '';
  }

  if (rows.length === 0) {
    return truncateText(emptyText, width);
  }

  return rows
    .slice(offset, offset + height)
    .map((row) => {
      if (row.type === 'header') {
        return truncateText(`${characters.header} ${row.title}`, width);
      }

      const cursor = row.item.id === activeId ? characters.active : ' ';
      const state =
        row.item.disabled === true
          ? characters.disabled
          : row.item.id === selectedId
            ? characters.selected
            : characters.idle;

      return truncateText(`${' '.repeat(indent)}${cursor} ${state} ${row.item.label}`, width);
    })
    .join('\n');
}
