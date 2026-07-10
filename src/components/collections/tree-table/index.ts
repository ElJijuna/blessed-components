import { pad, renderPlainLines } from '@/components/shared/text.js';

/** Tree-table row. */
export interface TreeTableRow {
  /** Child rows. */
  children?: readonly TreeTableRow[];

  /** Stable id. */
  id: string;

  /** Row label. */
  label: string;

  /** Column values keyed by column id. */
  values?: Readonly<Record<string, string | number>>;
}

/** Tree-table column. */
export interface TreeTableColumn {
  /** Column id. */
  key: string;

  /** Header label. Defaults to `key`. */
  header?: string;

  /** Fixed width. */
  width?: number;
}

/** Options accepted by {@link renderTreeTable}. */
export interface RenderTreeTableOptions {
  /** Columns after tree label. */
  columns: readonly TreeTableColumn[];

  /** Expanded row ids. */
  expandedIds?: readonly string[];

  /** Maximum rendered height. */
  height?: number;

  /** Root rows. */
  rows: readonly TreeTableRow[];

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

interface FlattenedTreeTableRow {
  line: string;
  row: TreeTableRow;
}

function flattenRows(
  rows: readonly TreeTableRow[],
  expanded: Set<string>,
  depth = 0,
): FlattenedTreeTableRow[] {
  return rows.flatMap((row) => {
    const children = row.children ?? [];
    const marker = children.length === 0 ? ' ' : expanded.has(row.id) ? '-' : '+';
    const line = `${'  '.repeat(depth)}${marker} ${row.label}`;

    return expanded.has(row.id)
      ? [{ line, row }, ...flattenRows(children, expanded, depth + 1)]
      : [{ line, row }];
  });
}

/** Renders hierarchical rows plus columns. */
export function renderTreeTable({
  columns,
  expandedIds = [],
  height,
  rows,
  width,
}: RenderTreeTableOptions): string {
  const expanded = new Set(expandedIds);
  const treeRows = flattenRows(rows, expanded);
  const labelWidth = Math.max('Name'.length, ...treeRows.map(({ line }) => line.length));
  const columnWidths = columns.map(
    (column) => column.width ?? column.header?.length ?? column.key.length,
  );
  const header = [
    pad('Name', labelWidth),
    ...columns.map((column, index) => pad(column.header ?? column.key, columnWidths[index] ?? 0)),
  ].join(' | ');
  const body = treeRows.map(({ line, row }) =>
    [
      pad(line, labelWidth),
      ...columns.map((column, index) =>
        pad(String(row.values?.[column.key] ?? ''), columnWidths[index] ?? 0),
      ),
    ].join(' | '),
  );

  return renderPlainLines([header, ...body], { height, width });
}
