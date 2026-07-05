import { describe, expect, it } from 'vitest';

import {
  type DataTableColumn,
  filterDataTableRows,
  paginateDataTableRows,
  renderDataTable,
  sortDataTableRows,
  visibleDataTableColumns,
} from '@/index.js';

interface Row {
  cpu: number;
  id: string;
  service: string;
}

const serviceColumn: DataTableColumn<Row> = { header: 'Service', id: 'service', sortable: true };
const cpuColumn: DataTableColumn<Row> = {
  align: 'right',
  header: 'CPU',
  id: 'cpu',
  sortAccessor: (row) => row.cpu,
  sortable: true,
  width: 5,
};
const columns: DataTableColumn<Row>[] = [serviceColumn, cpuColumn];
const rows = [
  { cpu: 42, id: 'api', service: 'API' },
  { cpu: 8, id: 'worker', service: 'Worker' },
  { cpu: 91, id: 'cache', service: 'Cache' },
  { cpu: 3, id: 'queue', service: 'Queue' },
  { cpu: 65, id: 'cron', service: 'Cron' },
];

describe('DataTable', () => {
  it('filters, sorts, and paginates before rendering, with a sort glyph and footer summary', () => {
    expect(
      renderDataTable({
        columns,
        height: 6,
        pageSize: 2,
        rows,
        sort: { columnId: 'cpu', direction: 'asc' },
        width: 24,
      }),
    ).toBe(
      '    Service        CPU ▲\n    ─────────────  ─────\n    Queue              3\n    Worker             8\nPage 1 of 3 · 5 rows',
    );
  });

  it('renders a safe empty state without mutating rows when the query matches nothing', () => {
    expect(
      renderDataTable({
        columns,
        emptyText: 'No matches',
        height: 4,
        query: 'zzz',
        rows,
        width: 24,
      }),
    ).toBe('    Service          CPU\n    ─────────────  ─────\n    No matches');
    expect(rows).toHaveLength(5);
  });

  it('excludes hidden columns from rendering and filtering', () => {
    const content = renderDataTable({
      columns,
      height: 7,
      hiddenColumnIds: ['cpu'],
      query: '42',
      rows,
      width: 24,
    });

    expect(content).not.toContain('CPU');
    expect(content).toContain('No rows');
  });

  it('omits the footer when the viewport is too narrow for one', () => {
    expect(
      renderDataTable({
        columns,
        height: 3,
        pageSize: 2,
        rows,
        width: 24,
      }),
    ).toBe('    Service          CPU\n    ─────────────  ─────\n    API               42');
  });
});

describe('filterDataTableRows', () => {
  it('returns rows unchanged for an empty or missing query', () => {
    expect(filterDataTableRows({ columns, rows })).toBe(rows);
    expect(filterDataTableRows({ columns, query: '   ', rows })).toBe(rows);
  });

  it('matches case-insensitively against filterable columns only', () => {
    const result = filterDataTableRows({
      columns: [{ ...serviceColumn, filterable: false }, cpuColumn],
      query: 'api',
      rows,
    });

    expect(result).toEqual([]);
  });

  it('matches a substring across default-filterable columns', () => {
    expect(filterDataTableRows({ columns, query: 'ca', rows })).toEqual([rows[2]]);
  });
});

describe('sortDataTableRows', () => {
  it('returns rows unchanged when sort is omitted or references an unknown column', () => {
    expect(sortDataTableRows({ columns, rows })).toBe(rows);
    expect(
      sortDataTableRows({ columns, rows, sort: { columnId: 'missing', direction: 'asc' } }),
    ).toBe(rows);
  });

  it('sorts numerically ascending and descending using sortAccessor', () => {
    const ascending = sortDataTableRows({
      columns,
      rows,
      sort: { columnId: 'cpu', direction: 'asc' },
    });

    expect(ascending.map((row) => row.id)).toEqual(['queue', 'worker', 'api', 'cron', 'cache']);

    const descending = sortDataTableRows({
      columns,
      rows,
      sort: { columnId: 'cpu', direction: 'desc' },
    });

    expect(descending.map((row) => row.id)).toEqual(['cache', 'cron', 'api', 'worker', 'queue']);
  });

  it('sorts alphabetically by the default accessor when no sortAccessor is given', () => {
    const sorted = sortDataTableRows({
      columns,
      rows,
      sort: { columnId: 'service', direction: 'asc' },
    });

    expect(sorted.map((row) => row.id)).toEqual(['api', 'cache', 'cron', 'queue', 'worker']);
  });

  it('does not mutate the input array', () => {
    const copy = [...rows];

    sortDataTableRows({ columns, rows, sort: { columnId: 'cpu', direction: 'asc' } });

    expect(rows).toEqual(copy);
  });
});

describe('paginateDataTableRows', () => {
  it('returns all rows on one page when pageSize is omitted', () => {
    expect(paginateDataTableRows({ rows })).toEqual({ page: 1, pageCount: 1, rows });
  });

  it('slices and clamps the requested page', () => {
    expect(paginateDataTableRows({ page: 2, pageSize: 2, rows })).toEqual({
      page: 2,
      pageCount: 3,
      rows: [rows[2], rows[3]],
    });
    expect(paginateDataTableRows({ page: 99, pageSize: 2, rows }).page).toBe(3);
    expect(paginateDataTableRows({ page: 0, pageSize: 2, rows }).page).toBe(1);
  });

  it('throws for a non-positive or fractional pageSize', () => {
    expect(() => paginateDataTableRows({ pageSize: 0, rows })).toThrow(RangeError);
    expect(() => paginateDataTableRows({ pageSize: 1.5, rows })).toThrow(RangeError);
  });
});

describe('visibleDataTableColumns', () => {
  it('excludes hidden column identifiers', () => {
    expect(visibleDataTableColumns(columns, ['cpu'])).toEqual([serviceColumn]);
    expect(visibleDataTableColumns(columns)).toEqual(columns);
  });
});
