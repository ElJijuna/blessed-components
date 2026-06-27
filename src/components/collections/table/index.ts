import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Minimum data required for one Table row. */
export interface TableRow {
  /** Whether keyboard navigation and selection must skip this row. */
  disabled?: boolean;

  /** Stable identifier used for cursor and selection state. */
  id: string;
}

/** Horizontal cell alignment. */
export type TableColumnAlign = 'left' | 'right';

/**
 * Column definition consumed by {@link renderTable}.
 *
 * @typeParam TRow - Row shape containing application data.
 */
export interface TableColumn<TRow extends TableRow = TableRow> {
  /** Cell alignment. */
  align?: TableColumnAlign;

  /** Returns the display value for this column. Defaults to `row[id]`. */
  accessor?: (row: TRow) => number | string;

  /** Header text displayed above body rows. */
  header: string;

  /** Stable column identifier. */
  id: string;

  /**
   * Preferred width in terminal cells.
   *
   * Numeric widths are fixed. `auto` shares remaining space with other auto
   * columns.
   *
   * @defaultValue `'auto'`
   */
  width?: 'auto' | number;
}

/** Character tokens used by {@link renderTable}. */
export interface TableCharacters {
  /** Marker shown beside the active row. */
  active: string;

  /** Separator used between columns. */
  columnGap: string;

  /** Marker shown beside disabled rows. */
  disabled: string;

  /** Character used for the header separator row. */
  headerSeparator: string;

  /** Marker shown beside enabled unselected rows. */
  idle: string;

  /** Marker shown beside the selected row. */
  selected: string;
}

/** Options accepted by {@link renderTable}. */
export interface RenderTableOptions<TRow extends TableRow = TableRow> {
  /** Identifier receiving the visible cursor marker. */
  activeId?: string;

  /** Ordered column definitions. */
  columns: readonly TableColumn<TRow>[];

  /** Character tokens used to communicate structure and state. */
  characters?: TableCharacters;

  /**
   * Text returned when `rows` is empty.
   *
   * @defaultValue `'No rows'`
   */
  emptyText?: string;

  /** Maximum number of rendered terminal rows including header and separator. */
  height: number;

  /**
   * First rendered body row index.
   *
   * @defaultValue `0`
   */
  offset?: number;

  /** Ordered table rows. Caller-owned data is never mutated. */
  rows: readonly TRow[];

  /** Identifier receiving the selected marker. */
  selectedId?: string;

  /** Maximum terminal-cell width of each rendered line. */
  width: number;
}

type NormalizedColumn<TRow extends TableRow> = Required<TableColumn<TRow>>;

const DEFAULT_CHARACTERS: TableCharacters = {
  active: '›',
  columnGap: '  ',
  disabled: '×',
  headerSeparator: '─',
  idle: ' ',
  selected: '●',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function pad(value: string, width: number, align: TableColumnAlign): string {
  const gap = ' '.repeat(Math.max(0, width - visibleWidth(value)));

  return align === 'right' ? `${gap}${value}` : `${value}${gap}`;
}

function fitCell(value: string, width: number, align: TableColumnAlign): string {
  return pad(truncateText(plainText(value), width), width, align);
}

function normalizeColumns<TRow extends TableRow>(
  columns: readonly TableColumn<TRow>[],
): NormalizedColumn<TRow>[] {
  if (columns.length === 0) {
    throw new RangeError('Table requires at least one column.');
  }

  return columns.map((column) => {
    if (column.id.length === 0 || /[\r\n]/u.test(column.id)) {
      throw new RangeError('Table column ids must be non-empty and fit on one line.');
    }

    const header = plainText(column.header);

    if (header.length === 0 || /[\r\n]/u.test(header)) {
      throw new RangeError('Table column headers must be non-empty and fit on one line.');
    }

    if (
      column.width !== undefined &&
      column.width !== 'auto' &&
      (!Number.isInteger(column.width) || column.width < 1)
    ) {
      throw new RangeError('Table column widths must be positive integers or auto.');
    }

    return {
      accessor: column.accessor ?? ((row: TRow) => String(row[column.id as keyof TRow] ?? '')),
      align: column.align ?? 'left',
      header,
      id: column.id,
      width: column.width ?? 'auto',
    };
  });
}

function distributeColumnWidths<TRow extends TableRow>(
  columns: readonly NormalizedColumn<TRow>[],
  rows: readonly TRow[],
  availableWidth: number,
): number[] {
  if (availableWidth <= 0) {
    return columns.map(() => 0);
  }

  const fixedTotal = columns.reduce(
    (total, column) => total + (typeof column.width === 'number' ? column.width : 0),
    0,
  );
  const autoColumns = columns.filter((column) => column.width === 'auto');
  const autoBudget = Math.max(0, availableWidth - fixedTotal);
  const naturalWidths = columns.map((column) =>
    Math.max(
      visibleWidth(column.header),
      ...rows.map((row) => visibleWidth(plainText(String(column.accessor(row))))),
      1,
    ),
  );
  const widths = columns.map((column, index) =>
    typeof column.width === 'number' ? column.width : Math.min(naturalWidths[index] ?? 1, 12),
  );

  if (autoColumns.length > 0) {
    const autoIndexes = columns
      .map((column, index) => (column.width === 'auto' ? index : -1))
      .filter((index) => index >= 0);
    const base = Math.floor(autoBudget / autoIndexes.length);

    let remainder = autoBudget % autoIndexes.length;

    for (const index of autoIndexes) {
      widths[index] = Math.max(1, base + (remainder > 0 ? 1 : 0));
      remainder -= 1;
    }
  }

  const overflow = widths.reduce((total, columnWidth) => total + columnWidth, 0) - availableWidth;

  if (overflow > 0) {
    let remaining = overflow;

    for (let index = widths.length - 1; index >= 0 && remaining > 0; index -= 1) {
      const shrinkBy = Math.min(Math.max(0, (widths[index] ?? 0) - 1), remaining);

      widths[index] = (widths[index] ?? 0) - shrinkBy;
      remaining -= shrinkBy;
    }
  }

  return widths;
}

/**
 * Renders a bounded, terminal-cell-aware table viewport.
 *
 * The renderer is deterministic, strips ANSI and Blessed markup from dynamic
 * data, and keeps all row state visible without relying on color.
 *
 * @param options - Rows, columns, state identifiers, dimensions, and characters.
 * @returns Plain text containing at most `height` rows.
 *
 * @throws `RangeError`
 * Thrown when dimensions, offsets, or column definitions are invalid.
 */
export function renderTable<TRow extends TableRow>({
  activeId,
  characters = DEFAULT_CHARACTERS,
  columns,
  emptyText = 'No rows',
  height,
  offset = 0,
  rows,
  selectedId,
  width,
}: RenderTableOptions<TRow>): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('Table dimensions and offset must be non-negative integers.');
  }

  if (height === 0 || width === 0) {
    return '';
  }

  const normalizedColumns = normalizeColumns(columns);
  const normalizedGap = plainText(characters.columnGap);
  const stateWidth = 4;
  const gapWidth = visibleWidth(normalizedGap) * Math.max(0, normalizedColumns.length - 1);
  const availableColumnWidth = Math.max(0, width - stateWidth - gapWidth);
  const columnWidths = distributeColumnWidths(normalizedColumns, rows, availableColumnWidth);
  const renderCells = (values: readonly string[], separator?: string): string =>
    truncateText(
      values
        .map((value, index) => {
          const column = normalizedColumns[index];
          const columnWidth = columnWidths[index] ?? 0;

          return separator === undefined
            ? fitCell(value, columnWidth, column?.align ?? 'left')
            : separator.repeat(columnWidth);
        })
        .join(normalizedGap),
      Math.max(0, width - stateWidth),
    );
  const header = truncateText(
    `${' '.repeat(stateWidth)}${renderCells(normalizedColumns.map(({ header }) => header))}`,
    width,
  );
  const separator = truncateText(
    `${' '.repeat(stateWidth)}${renderCells(
      normalizedColumns.map(() => ''),
      plainText(characters.headerSeparator).at(0) ?? '-',
    )}`,
    width,
  );

  if (height < 3) {
    return [header, separator].slice(0, height).join('\n');
  }

  if (rows.length === 0) {
    return [header, separator, truncateText(`${' '.repeat(stateWidth)}${emptyText}`, width)]
      .slice(0, height)
      .join('\n');
  }

  const bodyHeight = height - 2;
  const body = rows.slice(offset, offset + bodyHeight).map((row) => {
    const cursor = row.id === activeId ? characters.active : ' ';
    const state =
      row.disabled === true
        ? characters.disabled
        : row.id === selectedId
          ? characters.selected
          : characters.idle;
    const cells = renderCells(normalizedColumns.map((column) => String(column.accessor(row))));

    return truncateText(`${cursor} ${state} ${cells}`, width);
  });

  return [header, separator, ...body].join('\n');
}
