import blessed from 'blessed';

import {
  type DataTableCharacters,
  type DataTableColumn,
  type DataTableSort,
  filterDataTableRows,
  formatDataTablePaginationSummary,
  paginateDataTableRows,
  sortDataTableRows,
  visibleDataTableColumns,
  withDataTableSortIndicator,
} from '@/components/collections/data-table/index.js';
import { renderTable, type TableRow } from '@/components/collections/table/index.js';
import { truncateText } from '@/core/truncate.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import { createSelectionModel } from '@/primitives/selection/index.js';
import type { BlessedComponentHandle } from './types.js';

/**
 * Blessed box options supported by the DataTable adapter.
 *
 * `parent`, `content`, and `tags` are managed by {@link dataTable}. Keyboard
 * and mouse input are enabled by default and can still be disabled through
 * `keys: false` or `mouse: false`.
 */
export type DataTableBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link dataTable} adapter. */
export interface DataTableData<TRow extends TableRow = TableRow> {
  /** Preferred initial cursor identifier. */
  activeId?: string;

  /** Character tokens used by the pure renderer. */
  characters?: DataTableCharacters;

  /** Ordered column definitions. */
  columns: readonly DataTableColumn<TRow>[];

  /** Initial hidden column identifiers. @defaultValue `[]` */
  defaultHiddenColumnIds?: readonly string[];

  /** Initial 1-based page. Ignored when `pageSize` is omitted. @defaultValue `1` */
  defaultPage?: number;

  /** Initial search text. */
  defaultQuery?: string;

  /** Initial sort. */
  defaultSort?: DataTableSort;

  /** Initial selection for uncontrolled usage. Ignored when `value` is supplied. */
  defaultValue?: string;

  /** Text displayed when no rows match. */
  emptyText?: string;

  /** Rows per page. Pagination is disabled when omitted. */
  pageSize?: number;

  /** Ordered rows. Caller-owned data is never mutated. */
  rows: readonly TRow[];

  /** Called after the cursor moves to a different enabled row. */
  onActiveIdChange?: (activeId: string) => void;

  /** Called after hidden column identifiers change. */
  onHiddenColumnIdsChange?: (hiddenColumnIds: readonly string[]) => void;

  /** Called after the current page changes. */
  onPageChange?: (page: number) => void;

  /** Called after the search text changes. */
  onQueryChange?: (query: string) => void;

  /** Called after the active sort changes. */
  onSortChange?: (sort: DataTableSort | undefined) => void;

  /** Called when Enter or {@link DataTableHandle.selectActive} requests selection. */
  onValueChange?: (value: string) => void;

  /** Controlled selected identifier. */
  value?: string;
}

/** Options accepted by the Blessed {@link dataTable} adapter. */
export interface DataTableOptions<TRow extends TableRow = TableRow> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: DataTableBoxOptions;

  /** Columns, rows, controlled or uncontrolled value, and change listeners. */
  data: DataTableData<TRow>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link dataTable}. */
export interface DataTableHandle<TRow extends TableRow = TableRow>
  extends BlessedComponentHandle<DataTableData<TRow>, blessed.Widgets.BoxElement> {
  /** Returns the current enabled cursor identifier. */
  activeId(): string | undefined;

  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Moves the cursor to an enabled row identifier on the current page. */
  focusRow(id: string): string | undefined;

  /** Moves the cursor to the first enabled row on the current page. */
  first(): string | undefined;

  /** Returns the current hidden column identifiers. */
  hiddenColumnIds(): readonly string[];

  /** Moves the cursor to the last enabled row on the current page. */
  last(): string | undefined;

  /** Moves the cursor to the next enabled row, wrapping at the end of the page. */
  next(): string | undefined;

  /** Moves to the next page. No-op when pagination is disabled. */
  nextPage(): number;

  /** Returns the current 1-based page and total page count. */
  page(): { page: number; pageCount: number };

  /** Moves the cursor one viewport page backward, or to the previous page when paginated. */
  pageBackward(): string | undefined;

  /** Moves the cursor one viewport page forward, or to the next page when paginated. */
  pageForward(): string | undefined;

  /** Moves to the previous page. No-op when pagination is disabled. */
  previousPage(): number;

  /** Moves the cursor to the previous enabled row, wrapping at the start of the page. */
  previous(): string | undefined;

  /** Returns the current search text. */
  query(): string | undefined;

  /** Selects the active row or emits a controlled selection request. */
  selectActive(): string | undefined;

  /** Replaces hidden column identifiers. Ignores a request that would hide every column. */
  setHiddenColumnIds(hiddenColumnIds: readonly string[]): readonly string[];

  /** Moves to a specific 1-based page. Clamped to the available page range. */
  setPage(page: number): number;

  /** Replaces the search text and returns to page 1. */
  setQuery(query: string): void;

  /** Replaces the active sort. */
  setSort(sort: DataTableSort | undefined): void;

  /** Returns the current sort. */
  sort(): DataTableSort | undefined;

  /**
   * Cycles a sortable column through ascending, descending, and unsorted.
   * No-op when the column is not marked `sortable`.
   */
  toggleSort(columnId: string): DataTableSort | undefined;

  /** Returns the current controlled or uncontrolled selected identifier. */
  value(): string | undefined;
}

interface Keypress {
  full?: string;
  name?: string;
}

interface MouseEvent {
  y?: number;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function absoluteElementTop(element: blessed.Widgets.BoxElement): number {
  const positionedElement = element as blessed.Widgets.BoxElement & {
    atop?: blessed.Widgets.Types.TPosition;
  };

  return numericDimension(positionedElement.atop ?? positionedElement.top);
}

/**
 * Creates an interactive single-selection DataTable backed by a Blessed box.
 *
 * Layers filtering, sorting, pagination, and column visibility on top of the
 * Table keyboard map, selection model, and scroll behavior.
 */
export function dataTable<TRow extends TableRow>({
  box,
  data: initialData,
  parent,
}: DataTableOptions<TRow>): DataTableHandle<TRow> {
  let data = initialData;
  let uncontrolledValue = initialData.defaultValue;
  let currentActiveId = initialData.activeId;
  let hiddenColumnIdState: readonly string[] = initialData.defaultHiddenColumnIds ?? [];
  let pageState = initialData.defaultPage ?? 1;
  let queryState = initialData.defaultQuery;
  let sortState = initialData.defaultSort;
  let offset = 0;

  const element = blessed.box({
    keys: true,
    mouse: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const viewportSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const showsFooter = (): boolean => data.pageSize !== undefined && viewportSize().height >= 4;
  const bodyHeight = (): number => Math.max(0, viewportSize().height - 2 - (showsFooter() ? 1 : 0));
  const isControlled = (): boolean => Object.hasOwn(data, 'value');
  const selectedValue = (): string | undefined => (isControlled() ? data.value : uncontrolledValue);
  const computeView = (): {
    columns: readonly DataTableColumn<TRow>[];
    page: number;
    pageCount: number;
    rows: readonly TRow[];
  } => {
    const columnsInView = visibleDataTableColumns(data.columns, hiddenColumnIdState);
    const filtered = filterDataTableRows({
      columns: columnsInView,
      ...(queryState === undefined ? {} : { query: queryState }),
      rows: data.rows,
    });
    const sorted = sortDataTableRows({
      columns: columnsInView,
      rows: filtered,
      ...(sortState === undefined ? {} : { sort: sortState }),
    });
    const paginated = paginateDataTableRows({
      page: pageState,
      ...(data.pageSize === undefined ? {} : { pageSize: data.pageSize }),
      rows: sorted,
    });

    return {
      columns: columnsInView,
      page: paginated.page,
      pageCount: paginated.pageCount,
      rows: paginated.rows,
    };
  };

  let view = computeView();
  let focusScope = createFocusScope({ items: view.rows });

  const initialValue = selectedValue();

  let selection = createSelectionModel({
    defaultSelectedIds: initialValue === undefined ? [] : [initialValue],
    items: view.rows,
  });
  let scrollArea = createScrollArea({
    contentSize: view.rows.length,
    viewportSize: bodyHeight(),
  });

  const render = (): void => {
    const dimensions = viewportSize();
    const value = selectedValue();
    const footerVisible = showsFooter();
    const tableHeight = Math.max(0, dimensions.height - (footerVisible ? 1 : 0));

    scrollArea.setSizes({
      contentSize: view.rows.length,
      viewportSize: Math.max(0, tableHeight - 2),
    });
    offset = scrollArea.scrollTo(offset);

    const tableContent = renderTable({
      ...(currentActiveId === undefined ? {} : { activeId: currentActiveId }),
      ...(data.characters === undefined ? {} : { characters: data.characters }),
      columns: withDataTableSortIndicator(view.columns, sortState, data.characters),
      ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
      height: tableHeight,
      offset,
      rows: view.rows,
      ...(value === undefined ? {} : { selectedId: value }),
      width: dimensions.width,
    });

    if (!footerVisible) {
      element.setContent(tableContent);

      return;
    }

    const footer = truncateText(
      formatDataTablePaginationSummary(view.page, view.pageCount, view.rows.length),
      dimensions.width,
    );

    element.setContent(`${tableContent}\n${footer}`);
  };
  const ensureActiveVisible = (): void => {
    const index = view.rows.findIndex(({ id }) => id === currentActiveId);
    const height = bodyHeight();

    if (index < 0 || height === 0) {
      return;
    }

    if (index < offset) {
      offset = scrollArea.scrollTo(index);
    } else if (index >= offset + height) {
      offset = scrollArea.scrollTo(index - height + 1);
    }
  };
  const setActive = (id: string | undefined): string | undefined => {
    if (id === undefined || id === currentActiveId) {
      return currentActiveId;
    }

    currentActiveId = id;
    ensureActiveVisible();
    data.onActiveIdChange?.(id);
    render();

    return currentActiveId;
  };
  const move = (direction: 'next' | 'previous'): string | undefined =>
    setActive(focusScope[direction]());
  const rowIndexAtY = (screenY: number): number | undefined => {
    const row = screenY - absoluteElementTop(element) - numericDimension(element.itop);
    const bodyRow = row - 2;

    if (!Number.isInteger(bodyRow) || bodyRow < 0 || bodyRow >= bodyHeight()) {
      return undefined;
    }

    const index = offset + bodyRow;

    return index >= view.rows.length ? undefined : index;
  };
  const focusAtIndex = (index: number): string | undefined => {
    const row = view.rows[index];

    return row === undefined ? currentActiveId : setActive(focusScope.focus(row.id));
  };
  const focusNearest = (index: number, direction: 'backward' | 'forward'): string | undefined => {
    const step = direction === 'forward' ? 1 : -1;

    for (
      let candidateIndex = index;
      candidateIndex >= 0 && candidateIndex < view.rows.length;
      candidateIndex += step
    ) {
      const candidate = view.rows[candidateIndex];

      if (candidate?.disabled !== true) {
        return focusAtIndex(candidateIndex);
      }
    }

    return currentActiveId;
  };
  const rebuildModels = (): void => {
    const previousActiveId = currentActiveId;

    view = computeView();

    focusScope = createFocusScope({
      ...(data.activeId === undefined ? {} : { initialFocusId: data.activeId }),
      items: view.rows,
    });
    currentActiveId = focusScope.activate();

    if (
      data.activeId === undefined &&
      previousActiveId !== undefined &&
      view.rows.some(({ disabled, id }) => id === previousActiveId && disabled !== true)
    ) {
      currentActiveId = focusScope.focus(previousActiveId);
    }

    const currentValue = selectedValue();

    selection = createSelectionModel({
      defaultSelectedIds: currentValue === undefined ? [] : [currentValue],
      items: view.rows,
    });
    scrollArea = createScrollArea({
      contentSize: view.rows.length,
      offset,
      viewportSize: bodyHeight(),
    });
    ensureActiveVisible();
  };

  focusScope.activate();
  currentActiveId = focusScope.focus(currentActiveId ?? '') ?? focusScope.current();
  ensureActiveVisible();
  render();

  const handle: DataTableHandle<TRow> = {
    activeId: () => currentActiveId,
    destroy() {
      element.destroy();
    },
    element,
    first: () => focusNearest(0, 'forward'),
    focus() {
      element.focus();
    },
    focusRow: (id) => setActive(focusScope.focus(id)),
    hiddenColumnIds: () => hiddenColumnIdState,
    last: () => focusNearest(view.rows.length - 1, 'backward'),
    next: () => move('next'),
    nextPage: () => handle.setPage(pageState + 1),
    page: () => ({ page: view.page, pageCount: view.pageCount }),
    pageBackward() {
      if (data.pageSize !== undefined) {
        handle.previousPage();

        return handle.first();
      }

      const nextOffset = scrollArea.pageBackward();

      return focusNearest(nextOffset, 'backward');
    },
    pageForward() {
      if (data.pageSize !== undefined) {
        handle.nextPage();

        return handle.first();
      }

      const nextOffset = scrollArea.pageForward();
      const index = Math.min(view.rows.length - 1, nextOffset);

      return focusNearest(index, 'forward');
    },
    previous: () => move('previous'),
    previousPage: () => handle.setPage(pageState - 1),
    query: () => queryState,
    selectActive() {
      if (currentActiveId === undefined) {
        return undefined;
      }

      if (isControlled()) {
        data.onValueChange?.(currentActiveId);

        return currentActiveId;
      }

      if (selection.select(currentActiveId)) {
        uncontrolledValue = currentActiveId;
        data.onValueChange?.(currentActiveId);
        render();
      }

      return currentActiveId;
    },
    setData(nextData) {
      data = nextData;

      if (isControlled()) {
        uncontrolledValue = undefined;
      } else if (
        uncontrolledValue !== undefined &&
        !data.rows.some(({ disabled, id }) => id === uncontrolledValue && disabled !== true)
      ) {
        uncontrolledValue = data.defaultValue;
      }

      rebuildModels();
      render();
    },
    setHiddenColumnIds(nextHiddenColumnIds) {
      const nextVisible = data.columns.some((column) => !nextHiddenColumnIds.includes(column.id));

      if (!nextVisible) {
        return hiddenColumnIdState;
      }

      hiddenColumnIdState = nextHiddenColumnIds;
      pageState = 1;
      rebuildModels();
      data.onHiddenColumnIdsChange?.(hiddenColumnIdState);
      render();

      return hiddenColumnIdState;
    },
    setPage(nextPage) {
      pageState = nextPage;
      rebuildModels();
      data.onPageChange?.(view.page);
      render();

      return view.page;
    },
    setQuery(nextQuery) {
      queryState = nextQuery;
      pageState = 1;
      rebuildModels();
      data.onQueryChange?.(queryState);
      render();
    },
    setSort(nextSort) {
      sortState = nextSort;
      rebuildModels();
      data.onSortChange?.(sortState);
      render();
    },
    sort: () => sortState,
    toggleSort(columnId) {
      const column = data.columns.find(({ id }) => id === columnId);

      if (column === undefined || column.sortable !== true) {
        return sortState;
      }

      const nextDirection =
        sortState?.columnId !== columnId
          ? 'asc'
          : sortState.direction === 'asc'
            ? 'desc'
            : undefined;

      handle.setSort(
        nextDirection === undefined ? undefined : { columnId, direction: nextDirection },
      );

      return sortState;
    },
    value: selectedValue,
  };

  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'down':
        handle.next();
        break;
      case 'end':
        handle.last();
        break;
      case 'enter':
      case 'space':
        handle.selectActive();
        break;
      case 'home':
        handle.first();
        break;
      case 'pagedown':
        handle.pageForward();
        break;
      case 'pageup':
        handle.pageBackward();
        break;
      case 'up':
        handle.previous();
        break;
    }
  });
  element.on('click', (event: MouseEvent) => {
    if (event.y === undefined) {
      return;
    }

    const index = rowIndexAtY(event.y);

    if (index === undefined) {
      return;
    }

    const row = view.rows[index];

    if (row === undefined || row.disabled === true) {
      return;
    }

    setActive(focusScope.focus(row.id));
    handle.selectActive();
  });
  element.on('resize', render);
  element.on('wheeldown', () => {
    handle.next();
  });
  element.on('wheelup', () => {
    handle.previous();
  });

  return handle;
}
