# DataTable

DataTable layers filtering, sorting, pagination, and column visibility on top
of `renderTable`. Column widths are recalculated from available width on
every call, the same responsive behavior `Table` already provides.

```ts
import { renderDataTable } from 'blessed-components/data-table';

renderDataTable({
  columns: [
    { header: 'Service', id: 'service', sortable: true },
    { align: 'right', header: 'CPU', id: 'cpu', sortable: true, width: 5 },
  ],
  height: 6,
  pageSize: 2,
  query: 'a',
  rows: [
    { cpu: '42%', id: 'api', service: 'API' },
    { cpu: '8%', id: 'worker', service: 'Worker' },
    { cpu: '3%', id: 'cache', service: 'Cache' },
  ],
  sort: { columnId: 'cpu', direction: 'asc' },
  width: 32,
});
```

`filterDataTableRows`, `sortDataTableRows`, `paginateDataTableRows`, and
`visibleDataTableColumns` are also exported individually for callers that
need the intermediate rows, for example to build custom pagination controls.

- `query` matches a case-insensitive substring against every column with
  `filterable !== false`, using the column's `accessor`.
- `sort` matches a column by `columnId` and orders rows using
  `sortAccessor` (falling back to `accessor`). Numbers compare numerically;
  everything else compares as locale-aware, numeric-aware text. An unknown
  `columnId` leaves rows unchanged. The sorted column's header receives a
  `▲`/`▼` glyph.
- `pageSize` slices rows into a clamped page and appends a
  `"Page X of Y · N rows"` footer line, provided at least 4 rows of height
  are available. Omit `pageSize` to fall back to `Table`'s continuous
  `offset`-based scrolling.
- `hiddenColumnIds` removes columns from rendering, filtering, and sorting.

Use `dataTable` from `blessed-components/data-table/blessed` for the
interactive Blessed adapter. It reuses the Table keyboard map — Arrow
Up/Down, Home/End, Enter, and Space navigate and select rows on the current
page — and adds:

- `setQuery`, `setSort`, `toggleSort`, `setPage`, `nextPage`, `previousPage`,
  and `setHiddenColumnIds` imperative methods, each paired with an
  `onQueryChange`, `onSortChange`, `onPageChange`, or
  `onHiddenColumnIdsChange` callback.
- `toggleSort` cycles a column through ascending, descending, and cleared,
  and is a no-op unless the column declares `sortable: true`.
- Page Up/Down move between pages when `pageSize` is set, or scroll the
  viewport like `Table` otherwise.
- `setHiddenColumnIds` ignores a request that would hide every column.

Row selection follows the same controlled (`value`/`onValueChange`) and
uncontrolled (`defaultValue`) contract as `Table`. Search text, sort, page,
and hidden columns are uncontrolled only, seeded from `defaultQuery`,
`defaultSort`, `defaultPage`, and `defaultHiddenColumnIds`.

Mouse support matches `Table`: row click focuses and selects the clicked
enabled body row on the current page, and mouse wheel moves the active row.
