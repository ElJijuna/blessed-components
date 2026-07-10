import { fitPlain, pad, renderPlainLines } from '@/components/shared/text.js';

/** Column definition for {@link renderVirtualTable}. */
export interface VirtualTableColumn<
  TRow extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Row object key. */
  key: keyof TRow & string;

  /** Header label. Defaults to `key`. */
  header?: string;

  /** Fixed terminal-cell width. Defaults to max visible content width. */
  width?: number;
}

/** Options accepted by {@link renderVirtualTable}. */
export interface RenderVirtualTableOptions<
  TRow extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Visible columns. */
  columns: readonly VirtualTableColumn<TRow>[];

  /** Maximum rendered height. */
  height?: number;

  /** Maximum number of body rows to render. */
  rowCount?: number;

  /** First body row index. */
  start?: number;

  /** All rows. */
  rows: readonly TRow[];

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders only a visible window of table rows. */
export function renderVirtualTable<TRow extends Record<string, unknown>>({
  columns,
  height,
  rowCount,
  rows,
  start = 0,
  width,
}: RenderVirtualTableOptions<TRow>): string {
  if (!Number.isInteger(start) || start < 0) {
    throw new RangeError('VirtualTable start must be a non-negative integer.');
  }

  if (rowCount !== undefined && (!Number.isInteger(rowCount) || rowCount < 0)) {
    throw new RangeError('VirtualTable rowCount must be a non-negative integer.');
  }

  const visibleRows = rows.slice(start, rowCount === undefined ? undefined : start + rowCount);
  const widths = columns.map((column) => {
    if (column.width !== undefined) {
      if (!Number.isInteger(column.width) || column.width < 0) {
        throw new RangeError('VirtualTable column widths must be non-negative integers.');
      }

      return column.width;
    }

    return Math.max(
      column.header?.length ?? column.key.length,
      ...visibleRows.map((row) => String(row[column.key] ?? '').length),
    );
  });
  const renderRow = (values: readonly string[]) =>
    fitPlain(values.map((value, index) => pad(value, widths[index] ?? 0)).join(' | '), width);

  return renderPlainLines(
    [
      renderRow(columns.map((column) => column.header ?? column.key)),
      ...visibleRows.map((row) =>
        renderRow(columns.map((column) => String(row[column.key] ?? ''))),
      ),
    ],
    { height },
  );
}
