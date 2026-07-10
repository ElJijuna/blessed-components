import { pad, renderPlainLines } from '@/components/shared/text.js';

/** Query result column. */
export interface QueryResultsColumn {
  key: string;
  header?: string;
  width?: number;
}

/** Options accepted by {@link renderQueryResults}. */
export interface RenderQueryResultsOptions {
  /** Columns. */
  columns: readonly QueryResultsColumn[];

  /** Execution duration in milliseconds. */
  durationMs?: number;

  /** Maximum rendered height. */
  height?: number;

  /** Row data. */
  rows: readonly Readonly<Record<string, string | number | null>>[];

  /** Maximum terminal-cell width. */
  width?: number;
}

/** Renders database result rows plus execution metadata. */
export function renderQueryResults({
  columns,
  durationMs,
  height,
  rows,
  width,
}: RenderQueryResultsOptions): string {
  const widths = columns.map(
    (column) => column.width ?? column.header?.length ?? column.key.length,
  );
  const renderRow = (values: readonly string[]) =>
    values.map((value, index) => pad(value, widths[index] ?? 0)).join(' | ');
  const lines = [
    `rows: ${rows.length}${durationMs === undefined ? '' : ` (${durationMs}ms)`}`,
    renderRow(columns.map((column) => column.header ?? column.key)),
    ...rows.map((row) => renderRow(columns.map((column) => String(row[column.key] ?? 'NULL')))),
  ];

  return renderPlainLines(lines, { height, width });
}
