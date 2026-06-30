/** Horizontal row alignment used by Cluster. */
export type ClusterAlign = 'center' | 'end' | 'start';

/** Intrinsic terminal size of one Cluster item. */
export interface ClusterItemSize {
  /** Item height in terminal rows. */
  height: number;

  /** Item width in terminal cells. */
  width: number;
}

/** Positioned rectangle returned for one Cluster item. */
export interface ClusterItemLayout {
  /** Allocated height in terminal rows. */
  height: number;

  /** Allocated width in terminal cells. */
  width: number;

  /** Horizontal position in terminal cells. */
  x: number;

  /** Vertical position in terminal rows. */
  y: number;
}

/** Options accepted by {@link calculateClusterLayout}. */
export interface CalculateClusterLayoutOptions {
  /** Row alignment after wrapping. @defaultValue `'start'` */
  align?: ClusterAlign;

  /** Empty cells between adjacent items. Overrides `gap` horizontally. */
  columnGap?: number;

  /** Shared empty cells/rows between adjacent items and rows. @defaultValue `0` */
  gap?: number;

  /** Available container height in terminal rows. */
  height: number;

  /** Intrinsic sizes in visual order. */
  items: readonly ClusterItemSize[];

  /** Empty rows between wrapped rows. Overrides `gap` vertically. */
  rowGap?: number;

  /** Available container width in terminal cells. */
  width: number;
}

interface ClusterRowItem extends ClusterItemLayout {
  index: number;
}

interface ClusterRow {
  height: number;
  items: ClusterRowItem[];
  width: number;
  y: number;
}

function validateDimension(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

function alignOffset(available: number, size: number, align: ClusterAlign): number {
  const remaining = Math.max(0, available - size);

  if (align === 'center') {
    return Math.floor(remaining / 2);
  }

  return align === 'end' ? remaining : 0;
}

/**
 * Calculates wrapped inline positions for direct Cluster children.
 *
 * Items flow left to right until they no longer fit, then continue on the next
 * row. Oversized item widths are clamped to the available container width.
 */
export function calculateClusterLayout({
  align = 'start',
  columnGap,
  gap = 0,
  height,
  items,
  rowGap,
  width,
}: CalculateClusterLayoutOptions): ClusterItemLayout[] {
  validateDimension(width, 'Cluster width');
  validateDimension(height, 'Cluster height');
  validateDimension(gap, 'Cluster gap');

  const resolvedColumnGap = columnGap ?? gap;
  const resolvedRowGap = rowGap ?? gap;

  validateDimension(resolvedColumnGap, 'Cluster columnGap');
  validateDimension(resolvedRowGap, 'Cluster rowGap');

  for (const item of items) {
    validateDimension(item.width, 'Cluster item width');
    validateDimension(item.height, 'Cluster item height');
  }

  const rows: ClusterRow[] = [];
  let currentRow: ClusterRow = { height: 0, items: [], width: 0, y: 0 };
  const pushRow = (): void => {
    rows.push(currentRow);
    currentRow = {
      height: 0,
      items: [],
      width: 0,
      y: currentRow.y + currentRow.height + resolvedRowGap,
    };
  };

  for (const [index, item] of items.entries()) {
    const itemWidth = Math.min(width, item.width);
    const itemHeight = Math.min(height, item.height);
    const nextWidth =
      currentRow.items.length === 0 ? itemWidth : currentRow.width + resolvedColumnGap + itemWidth;

    if (currentRow.items.length > 0 && nextWidth > width) {
      pushRow();
    }

    const x = currentRow.items.length === 0 ? 0 : currentRow.width + resolvedColumnGap;
    const rowItem = {
      height: itemHeight,
      index,
      width: itemWidth,
      x,
      y: currentRow.y,
    };

    currentRow.items.push(rowItem);
    currentRow.height = Math.max(currentRow.height, itemHeight);
    currentRow.width =
      currentRow.items.length === 1 ? itemWidth : currentRow.width + resolvedColumnGap + itemWidth;
  }

  if (currentRow.items.length > 0) {
    rows.push(currentRow);
  }

  const layouts: ClusterItemLayout[] = Array.from({ length: items.length });

  for (const row of rows) {
    const xOffset = alignOffset(width, row.width, align);

    for (const item of row.items) {
      layouts[item.index] = {
        height: item.height,
        width: item.width,
        x: item.x + xOffset,
        y: item.y,
      };
    }
  }

  return layouts;
}
