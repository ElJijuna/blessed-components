/** Grid item placement accepted by {@link calculateGridLayout}. */
export interface GridItemPlacement {
  /** Zero-based column. When omitted, auto-placement is used. */
  column?: number;

  /** Number of columns spanned by the item. @defaultValue `1` */
  columnSpan?: number;

  /** Zero-based row. When omitted, auto-placement is used. */
  row?: number;

  /** Number of rows spanned by the item. @defaultValue `1` */
  rowSpan?: number;
}

/** Positioned rectangle returned for one Grid item. */
export interface GridItemLayout {
  /** Allocated height in terminal rows. */
  height: number;

  /** Allocated width in terminal cells. */
  width: number;

  /** Horizontal position in terminal cells. */
  x: number;

  /** Vertical position in terminal rows. */
  y: number;
}

/** Options accepted by {@link calculateGridLayout}. */
export interface CalculateGridLayoutOptions {
  /** Empty cells between adjacent columns. Overrides `gap` horizontally. */
  columnGap?: number;

  /** Number of columns in the grid. */
  columns: number;

  /** Shared empty cells/rows between adjacent tracks. @defaultValue `0` */
  gap?: number;

  /** Available container height in terminal rows. */
  height: number;

  /** Item placements in visual order. */
  items: readonly GridItemPlacement[];

  /** Empty rows between adjacent rows. Overrides `gap` vertically. */
  rowGap?: number;

  /** Number of rows in the grid. Inferred from items when omitted. */
  rows?: number;

  /** Available container width in terminal cells. */
  width: number;
}

interface ResolvedGridItemPlacement {
  column: number;
  columnSpan: number;
  row: number;
  rowSpan: number;
}

function validateDimension(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

function validatePositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer.`);
  }
}

function distributeTracks(size: number, count: number, gap: number): number[] {
  const available = Math.max(0, size - gap * Math.max(0, count - 1));
  const base = Math.floor(available / count);
  const remainder = available % count;

  return Array.from({ length: count }, (_value, index) => base + (index < remainder ? 1 : 0));
}

function sumTracks(tracks: readonly number[], start: number, span: number, gap: number): number {
  return (
    tracks.slice(start, start + span).reduce((total, track) => total + track, 0) + gap * (span - 1)
  );
}

function offsetFor(tracks: readonly number[], index: number, gap: number): number {
  return tracks.slice(0, index).reduce((total, track) => total + track, 0) + gap * index;
}

function resolvePlacements(
  items: readonly GridItemPlacement[],
  columns: number,
): ResolvedGridItemPlacement[] {
  let nextRow = 0;
  let nextColumn = 0;

  return items.map((item) => {
    const columnSpan = item.columnSpan ?? 1;
    const rowSpan = item.rowSpan ?? 1;

    validatePositiveInteger(columnSpan, 'Grid item columnSpan');
    validatePositiveInteger(rowSpan, 'Grid item rowSpan');

    if (columnSpan > columns) {
      throw new RangeError('Grid item columnSpan must not exceed column count.');
    }

    if (item.column !== undefined) {
      validateDimension(item.column, 'Grid item column');
    }

    if (item.row !== undefined) {
      validateDimension(item.row, 'Grid item row');
    }

    if (nextColumn + columnSpan > columns) {
      nextColumn = 0;
      nextRow += 1;
    }

    const column = item.column ?? nextColumn;
    const row = item.row ?? nextRow;

    if (column + columnSpan > columns) {
      throw new RangeError('Grid item placement must fit within column count.');
    }

    if (item.column === undefined && item.row === undefined) {
      nextColumn = column + columnSpan;

      if (nextColumn >= columns) {
        nextColumn = 0;
        nextRow = row + rowSpan;
      }
    }

    return { column, columnSpan, row, rowSpan };
  });
}

/**
 * Calculates deterministic positions for direct Grid children.
 *
 * Track sizes divide available terminal cells as evenly as possible. Remainder
 * cells are assigned to earlier rows or columns for stable, predictable layout.
 */
export function calculateGridLayout({
  columnGap,
  columns,
  gap = 0,
  height,
  items,
  rowGap,
  rows,
  width,
}: CalculateGridLayoutOptions): GridItemLayout[] {
  validatePositiveInteger(columns, 'Grid columns');
  validateDimension(width, 'Grid width');
  validateDimension(height, 'Grid height');
  validateDimension(gap, 'Grid gap');

  const resolvedColumnGap = columnGap ?? gap;
  const resolvedRowGap = rowGap ?? gap;

  validateDimension(resolvedColumnGap, 'Grid columnGap');
  validateDimension(resolvedRowGap, 'Grid rowGap');

  const placements = resolvePlacements(items, columns);
  const inferredRows = placements.reduce(
    (maximum, placement) => Math.max(maximum, placement.row + placement.rowSpan),
    0,
  );
  const rowCount = rows ?? Math.max(1, inferredRows);

  validatePositiveInteger(rowCount, 'Grid rows');

  for (const placement of placements) {
    if (placement.row + placement.rowSpan > rowCount) {
      throw new RangeError('Grid item placement must fit within row count.');
    }
  }

  const columnTracks = distributeTracks(width, columns, resolvedColumnGap);
  const rowTracks = distributeTracks(height, rowCount, resolvedRowGap);

  return placements.map((placement) => ({
    height: sumTracks(rowTracks, placement.row, placement.rowSpan, resolvedRowGap),
    width: sumTracks(columnTracks, placement.column, placement.columnSpan, resolvedColumnGap),
    x: offsetFor(columnTracks, placement.column, resolvedColumnGap),
    y: offsetFor(rowTracks, placement.row, resolvedRowGap),
  }));
}
