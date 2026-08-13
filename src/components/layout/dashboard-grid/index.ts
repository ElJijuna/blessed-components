/** One responsive dashboard widget. */
export interface DashboardGridItem {
  columnSpan?: number;
  id: string;
  minHeight?: number;
  rowSpan?: number;
}
/** Positioned widget rectangle. */
export interface DashboardGridItemLayout {
  height: number;
  id: string;
  width: number;
  x: number;
  y: number;
}
/** Responsive column breakpoint. */
export interface DashboardGridBreakpoint {
  columns: number;
  minWidth: number;
}
/** Layout options. */
export interface CalculateDashboardGridOptions<
  TItem extends DashboardGridItem = DashboardGridItem,
> {
  breakpoints?: readonly DashboardGridBreakpoint[];
  columnGap?: number;
  height: number;
  items: readonly TItem[];
  rowGap?: number;
  rowHeight?: number;
  width: number;
}
/** Layout result including resolved columns and content height. */
export interface DashboardGridLayout {
  columns: number;
  contentHeight: number;
  items: readonly DashboardGridItemLayout[];
}
const DEFAULT_BREAKPOINTS: readonly DashboardGridBreakpoint[] = [
  { columns: 1, minWidth: 0 },
  { columns: 2, minWidth: 60 },
  { columns: 3, minWidth: 100 },
];

function nonNegative(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

function positive(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive integer.`);
  }
}

/** Calculates responsive, auto-flowing dashboard widget regions. */
export function calculateDashboardGridLayout<TItem extends DashboardGridItem>({
  breakpoints = DEFAULT_BREAKPOINTS,
  columnGap = 1,
  height,
  items,
  rowGap = 1,
  rowHeight = 5,
  width,
}: CalculateDashboardGridOptions<TItem>): DashboardGridLayout {
  nonNegative(width, 'DashboardGrid width');
  nonNegative(height, 'DashboardGrid height');
  nonNegative(columnGap, 'DashboardGrid column gap');
  nonNegative(rowGap, 'DashboardGrid row gap');
  positive(rowHeight, 'DashboardGrid row height');

  if (breakpoints.length === 0) {
    throw new RangeError('DashboardGrid requires at least one breakpoint.');
  }

  for (const point of breakpoints) {
    nonNegative(point.minWidth, 'DashboardGrid breakpoint width');
    positive(point.columns, 'DashboardGrid breakpoint columns');
  }

  const columns =
    [...breakpoints]
      .sort((a, b) => a.minWidth - b.minWidth)
      .filter(({ minWidth }) => minWidth <= width)
      .at(-1)?.columns ??
    breakpoints[0]?.columns ??
    1;
  const tracksAvailable = Math.max(0, width - columnGap * Math.max(0, columns - 1));
  const base = Math.floor(tracksAvailable / columns);
  const remainder = tracksAvailable % columns;
  const tracks = Array.from({ length: columns }, (_, index) => base + (index < remainder ? 1 : 0));
  const occupied: boolean[][] = [];
  const layouts: DashboardGridItemLayout[] = [];
  const ids = new Set<string>();

  for (const item of items) {
    if (item.id.length === 0 || ids.has(item.id)) {
      throw new RangeError('DashboardGrid item ids must be non-empty and unique.');
    }

    ids.add(item.id);
    const columnSpan = Math.min(item.columnSpan ?? 1, columns);
    const rowSpan = item.rowSpan ?? 1;

    positive(columnSpan, 'DashboardGrid column span');
    positive(rowSpan, 'DashboardGrid row span');

    if (item.minHeight !== undefined) {
      nonNegative(item.minHeight, 'DashboardGrid minimum height');
    }

    let row = 0;
    let column = 0;
    let found = false;

    while (!found) {
      occupied[row] ??= Array(columns).fill(false);

      for (column = 0; column <= columns - columnSpan; column += 1) {
        let free = true;

        for (let r = row; r < row + rowSpan; r += 1) {
          occupied[r] ??= Array(columns).fill(false);

          if (occupied[r]?.slice(column, column + columnSpan).some(Boolean)) {
            free = false;
            break;
          }
        }

        if (free) {
          found = true;
          break;
        }
      }

      if (!found) {
        row += 1;
      }
    }

    for (let r = row; r < row + rowSpan; r += 1) {
      const occupiedRow = occupied[r];

      for (let c = column; c < column + columnSpan; c += 1) {
        if (occupiedRow) {
          occupiedRow[c] = true;
        }
      }
    }

    const x = tracks.slice(0, column).reduce((sum, track) => sum + track, 0) + columnGap * column;
    const itemWidth =
      tracks.slice(column, column + columnSpan).reduce((sum, track) => sum + track, 0) +
      columnGap * (columnSpan - 1);
    const naturalHeight = rowHeight * rowSpan + rowGap * (rowSpan - 1);

    layouts.push({
      height: Math.max(naturalHeight, item.minHeight ?? 0),
      id: item.id,
      width: itemWidth,
      x,
      y: row * (rowHeight + rowGap),
    });
  }

  const contentHeight = layouts.reduce((max, item) => Math.max(max, item.y + item.height), 0);

  return {
    columns,
    contentHeight: Math.max(contentHeight, Math.min(height, contentHeight)),
    items: layouts,
  };
}
