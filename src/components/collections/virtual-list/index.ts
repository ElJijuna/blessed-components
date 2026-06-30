import {
  type ListCharacters,
  type ListItem,
  renderList,
} from '@/components/collections/list/index.js';

/** Computed row window used by VirtualList renderers and adapters. */
export interface VirtualListWindow<TItem extends ListItem = ListItem> {
  /** Number of rows after the rendered window. */
  afterCount: number;

  /** Number of rows before the rendered window. */
  beforeCount: number;

  /** Exclusive source index for the rendered window. */
  endIndex: number;

  /** Items included in the rendered window, including overscan rows. */
  items: readonly TItem[];

  /** Clamped viewport offset requested by the caller. */
  offset: number;

  /** Inclusive source index for the rendered window. */
  startIndex: number;

  /** Offset of the visible viewport within `items`. */
  viewportOffset: number;
}

/** Options accepted by {@link computeVirtualListWindow}. */
export interface ComputeVirtualListWindowOptions<TItem extends ListItem = ListItem> {
  /** Number of visible rows. */
  height: number;

  /** Full ordered item collection. Caller-owned data is never mutated. */
  items: readonly TItem[];

  /** First visible source index. @defaultValue `0` */
  offset?: number;

  /** Extra rows retained before and after the visible viewport. @defaultValue `0` */
  overscan?: number;
}

/** Options accepted by {@link renderVirtualList}. */
export interface RenderVirtualListOptions<TItem extends ListItem = ListItem>
  extends ComputeVirtualListWindowOptions<TItem> {
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

  /** Identifier receiving the selected marker. */
  selectedId?: string;

  /** Maximum terminal-cell width of each row. */
  width: number;
}

function assertWindowOptions(height: number, offset: number, overscan: number): void {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    !Number.isInteger(overscan) ||
    overscan < 0
  ) {
    throw new RangeError('VirtualList height, offset, and overscan must be non-negative integers.');
  }
}

/**
 * Computes the source slice needed to render a virtual list viewport.
 *
 * The returned `items` array contains only visible rows plus optional overscan,
 * which keeps render work bounded even when the source collection is large.
 */
export function computeVirtualListWindow<TItem extends ListItem>({
  height,
  items,
  offset = 0,
  overscan = 0,
}: ComputeVirtualListWindowOptions<TItem>): VirtualListWindow<TItem> {
  assertWindowOptions(height, offset, overscan);

  const clampedOffset = Math.min(offset, Math.max(0, items.length - height));
  const startIndex = Math.max(0, clampedOffset - overscan);
  const endIndex = Math.min(items.length, clampedOffset + height + overscan);

  return {
    afterCount: Math.max(0, items.length - endIndex),
    beforeCount: startIndex,
    endIndex,
    items: items.slice(startIndex, endIndex),
    offset: clampedOffset,
    startIndex,
    viewportOffset: clampedOffset - startIndex,
  };
}

/**
 * Renders a terminal-cell-aware list from a bounded virtual row window.
 *
 * This renderer preserves the List visual contract while avoiding full-source
 * rendering. It is deterministic and delegates row formatting to `renderList`.
 */
export function renderVirtualList<TItem extends ListItem>({
  activeId,
  characters,
  emptyText,
  height,
  items,
  offset = 0,
  overscan = 0,
  selectedId,
  width,
}: RenderVirtualListOptions<TItem>): string {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('VirtualList width must be a non-negative integer.');
  }

  const window = computeVirtualListWindow({ height, items, offset, overscan });

  return renderList({
    ...(activeId === undefined ? {} : { activeId }),
    ...(characters === undefined ? {} : { characters }),
    ...(emptyText === undefined ? {} : { emptyText }),
    height,
    items: window.items,
    offset: window.viewportOffset,
    ...(selectedId === undefined ? {} : { selectedId }),
    width,
  });
}
