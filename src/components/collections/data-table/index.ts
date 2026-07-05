import {
  type RenderTableOptions,
  renderTable,
  type TableCharacters,
  type TableColumn,
  type TableRow,
} from '@/components/collections/table/index.js';
import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Column definition consumed by {@link renderDataTable}. */
export interface DataTableColumn<TRow extends TableRow = TableRow> extends TableColumn<TRow> {
  /** Whether this column is matched against `query`. @defaultValue `true` */
  filterable?: boolean;

  /** Whether this column may be sorted. @defaultValue `false` */
  sortable?: boolean;

  /** Value used for sorting. Falls back to `accessor`. */
  sortAccessor?: (row: TRow) => number | string;
}

/** Sort direction applied by {@link sortDataTableRows}. */
export type DataTableSortDirection = 'asc' | 'desc';

/** Active sort state consumed by {@link sortDataTableRows} and {@link renderDataTable}. */
export interface DataTableSort {
  /** Sorted column identifier. */
  columnId: string;

  /** Sort direction. */
  direction: DataTableSortDirection;
}

/** Character tokens used by {@link renderDataTable}. */
export interface DataTableCharacters extends TableCharacters {
  /** Marker appended to an ascending sorted column header. */
  sortAscending: string;

  /** Marker appended to a descending sorted column header. */
  sortDescending: string;
}

/** Options accepted by {@link sortDataTableRows}. */
export interface SortDataTableRowsOptions<TRow extends TableRow = TableRow> {
  /** Columns available for lookup by `sort.columnId`. */
  columns: readonly DataTableColumn<TRow>[];

  /** Ordered rows. Caller-owned data is never mutated. */
  rows: readonly TRow[];

  /** Sort request. Rows are returned unchanged when omitted or unmatched. */
  sort?: DataTableSort;
}

/** Options accepted by {@link filterDataTableRows}. */
export interface FilterDataTableRowsOptions<TRow extends TableRow = TableRow> {
  /** Columns searched for a text match. */
  columns: readonly DataTableColumn<TRow>[];

  /** Case-insensitive search text. Rows are returned unchanged when empty. */
  query?: string;

  /** Ordered rows. Caller-owned data is never mutated. */
  rows: readonly TRow[];
}

/** Result produced by {@link paginateDataTableRows}. */
export interface PaginateDataTableRowsResult<TRow extends TableRow = TableRow> {
  /** Clamped 1-based page index. */
  page: number;

  /** Total number of available pages, always at least `1`. */
  pageCount: number;

  /** Rows belonging to the clamped page. */
  rows: readonly TRow[];
}

/** Options accepted by {@link paginateDataTableRows}. */
export interface PaginateDataTableRowsOptions<TRow extends TableRow = TableRow> {
  /** Requested 1-based page index. @defaultValue `1` */
  page?: number;

  /** Rows per page. Pagination is disabled when omitted. */
  pageSize?: number;

  /** Ordered rows. Caller-owned data is never mutated. */
  rows: readonly TRow[];
}

/** Options accepted by {@link renderDataTable}. */
export interface RenderDataTableOptions<TRow extends TableRow = TableRow>
  extends Omit<RenderTableOptions<TRow>, 'characters' | 'columns'> {
  /** Character tokens used by the pure renderer. */
  characters?: DataTableCharacters;

  /** Ordered column definitions. */
  columns: readonly DataTableColumn<TRow>[];

  /** Column identifiers excluded from rendering, filtering, and sorting. */
  hiddenColumnIds?: readonly string[];

  /** Requested 1-based page index. Ignored when `pageSize` is omitted. @defaultValue `1` */
  page?: number;

  /** Rows per page. Pagination is disabled when omitted. */
  pageSize?: number;

  /** Case-insensitive search text matched against filterable columns. */
  query?: string;

  /** Active sort applied before pagination. */
  sort?: DataTableSort;
}

const DEFAULT_CHARACTERS: DataTableCharacters = {
  active: '›',
  columnGap: '  ',
  disabled: '×',
  headerSeparator: '─',
  idle: ' ',
  selected: '●',
  sortAscending: '▲',
  sortDescending: '▼',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function defaultAccessor<TRow extends TableRow>(
  column: DataTableColumn<TRow>,
): (row: TRow) => number | string {
  return column.accessor ?? ((row: TRow) => String(row[column.id as keyof TRow] ?? ''));
}

/** Returns visible columns, excluding any identifier present in `hiddenColumnIds`. */
export function visibleDataTableColumns<TRow extends TableRow>(
  columns: readonly DataTableColumn<TRow>[],
  hiddenColumnIds: readonly string[] = [],
): DataTableColumn<TRow>[] {
  return columns.filter((column) => !hiddenColumnIds.includes(column.id));
}

/** Filters rows by a case-insensitive substring match against filterable columns. */
export function filterDataTableRows<TRow extends TableRow>({
  columns,
  query,
  rows,
}: FilterDataTableRowsOptions<TRow>): readonly TRow[] {
  const trimmed = query?.trim() ?? '';

  if (trimmed.length === 0) {
    return rows;
  }

  const searchableColumns = columns.filter((column) => column.filterable !== false);
  const needle = trimmed.toLocaleLowerCase();

  return rows.filter((row) =>
    searchableColumns.some((column) =>
      plainText(String(defaultAccessor(column)(row)))
        .toLocaleLowerCase()
        .includes(needle),
    ),
  );
}

/** Sorts rows by the column matching `sort.columnId`. Returns `rows` unchanged when unmatched. */
export function sortDataTableRows<TRow extends TableRow>({
  columns,
  rows,
  sort,
}: SortDataTableRowsOptions<TRow>): readonly TRow[] {
  if (sort === undefined) {
    return rows;
  }

  const column = columns.find(({ id }) => id === sort.columnId);

  if (column === undefined) {
    return rows;
  }

  const accessor = column.sortAccessor ?? defaultAccessor(column);
  const direction = sort.direction === 'desc' ? -1 : 1;

  return [...rows].sort((left, right) => {
    const leftValue = accessor(left);
    const rightValue = accessor(right);

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction;
    }

    return (
      String(leftValue).localeCompare(String(rightValue), undefined, {
        numeric: true,
        sensitivity: 'base',
      }) * direction
    );
  });
}

/** Slices rows into a clamped page. Returns all rows on one page when `pageSize` is omitted. */
export function paginateDataTableRows<TRow extends TableRow>({
  page = 1,
  pageSize,
  rows,
}: PaginateDataTableRowsOptions<TRow>): PaginateDataTableRowsResult<TRow> {
  if (pageSize === undefined) {
    return { page: 1, pageCount: 1, rows };
  }

  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError('DataTable pageSize must be a positive integer.');
  }

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const clampedPage = Math.min(Math.max(1, Math.trunc(page)), pageCount);
  const start = (clampedPage - 1) * pageSize;

  return { page: clampedPage, pageCount, rows: rows.slice(start, start + pageSize) };
}

/** Appends a sort glyph to the header of the column matching `sort.columnId`. */
export function withDataTableSortIndicator<TRow extends TableRow>(
  columns: readonly DataTableColumn<TRow>[],
  sort: DataTableSort | undefined,
  characters: Pick<DataTableCharacters, 'sortAscending' | 'sortDescending'> = DEFAULT_CHARACTERS,
): DataTableColumn<TRow>[] {
  return columns.map((column) => {
    if (sort === undefined || sort.columnId !== column.id) {
      return column;
    }

    const glyph = sort.direction === 'desc' ? characters.sortDescending : characters.sortAscending;

    return { ...column, header: `${column.header} ${glyph}` };
  });
}

/** Formats the `"Page X of Y · N rows"` footer summary used when `pageSize` is set. */
export function formatDataTablePaginationSummary(
  page: number,
  pageCount: number,
  rowCount: number,
): string {
  const rowLabel = rowCount === 1 ? 'row' : 'rows';

  return `Page ${page} of ${pageCount} · ${rowCount} ${rowLabel}`;
}

/**
 * Renders a bounded table with filtering, sorting, pagination, and column
 * visibility layered on top of {@link renderTable}.
 *
 * Column widths are recalculated from available width on every call, the
 * same behavior `renderTable` already provides.
 *
 * @throws `RangeError`
 * Thrown when dimensions, offsets, `pageSize`, or column definitions are
 * invalid.
 */
export function renderDataTable<TRow extends TableRow>({
  characters = DEFAULT_CHARACTERS,
  columns,
  height,
  hiddenColumnIds = [],
  offset = 0,
  page,
  pageSize,
  query,
  rows,
  sort,
  width,
  ...rest
}: RenderDataTableOptions<TRow>): string {
  if (!Number.isInteger(height) || height < 0 || !Number.isInteger(width) || width < 0) {
    throw new RangeError('DataTable dimensions must be non-negative integers.');
  }

  const columnsInView = visibleDataTableColumns(columns, hiddenColumnIds);
  const filteredRows = filterDataTableRows({
    columns: columnsInView,
    ...(query === undefined ? {} : { query }),
    rows,
  });
  const sortedRows = sortDataTableRows({
    columns: columnsInView,
    rows: filteredRows,
    ...(sort === undefined ? {} : { sort }),
  });
  const paginated = paginateDataTableRows({
    ...(page === undefined ? {} : { page }),
    ...(pageSize === undefined ? {} : { pageSize }),
    rows: sortedRows,
  });
  const renderedColumns = withDataTableSortIndicator(columnsInView, sort, characters);
  const showFooter = pageSize !== undefined && height >= 4;
  const tableContent = renderTable({
    ...rest,
    characters,
    columns: renderedColumns,
    height: showFooter ? height - 1 : height,
    offset: pageSize === undefined ? offset : 0,
    rows: paginated.rows,
    width,
  });

  if (!showFooter) {
    return tableContent;
  }

  const footer = truncateText(
    formatDataTablePaginationSummary(paginated.page, paginated.pageCount, sortedRows.length),
    width,
  );

  return `${tableContent}\n${footer}`;
}
