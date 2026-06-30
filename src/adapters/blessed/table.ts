import blessed from 'blessed';

import {
  renderTable,
  type TableCharacters,
  type TableColumn,
  type TableRow,
} from '@/components/collections/table/index.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import { createSelectionModel } from '@/primitives/selection/index.js';
import type { BlessedComponentHandle } from './types.js';

/**
 * Blessed box options supported by the Table adapter.
 *
 * `parent`, `content`, and `tags` are managed by {@link table}. Keyboard and
 * mouse input are enabled by default and can still be disabled through
 * `keys: false` or `mouse: false`.
 */
export type TableBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link table} adapter. */
export interface TableData<TRow extends TableRow = TableRow> {
  /** Preferred initial cursor identifier. */
  activeId?: string;

  /** Ordered column definitions. */
  columns: readonly TableColumn<TRow>[];

  /** Character tokens used by the pure renderer. */
  characters?: TableCharacters;

  /** Initial selection for uncontrolled usage. Ignored when `value` is supplied. */
  defaultValue?: string;

  /** Text displayed when no rows exist. */
  emptyText?: string;

  /** Called after the cursor moves to a different enabled row. */
  onActiveIdChange?: (activeId: string) => void;

  /** Called when Enter or {@link TableHandle.selectActive} requests selection. */
  onValueChange?: (value: string) => void;

  /** Ordered rows. Disabled rows are visible but not interactive. */
  rows: readonly TRow[];

  /** Controlled selected identifier. */
  value?: string;
}

/** Options accepted by the Blessed {@link table} adapter. */
export interface TableOptions<TRow extends TableRow = TableRow> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: TableBoxOptions;

  /** Columns, rows, controlled or uncontrolled value, and change listeners. */
  data: TableData<TRow>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link table}. */
export interface TableHandle<TRow extends TableRow = TableRow>
  extends BlessedComponentHandle<TableData<TRow>, blessed.Widgets.BoxElement> {
  /** Returns the current enabled cursor identifier. */
  activeId(): string | undefined;

  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Moves the cursor to an enabled row identifier. */
  focusRow(id: string): string | undefined;

  /** Moves the cursor to the first enabled row. */
  first(): string | undefined;

  /** Moves the cursor to the last enabled row. */
  last(): string | undefined;

  /** Moves the cursor to the next enabled row, wrapping at the end. */
  next(): string | undefined;

  /** Moves the cursor one viewport page backward. */
  pageBackward(): string | undefined;

  /** Moves the cursor one viewport page forward. */
  pageForward(): string | undefined;

  /** Moves the cursor to the previous enabled row, wrapping at the start. */
  previous(): string | undefined;

  /** Selects the active row or emits a controlled selection request. */
  selectActive(): string | undefined;

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

/** Creates an interactive single-selection Table backed by a Blessed box. */
export function table<TRow extends TableRow>({
  box,
  data: initialData,
  parent,
}: TableOptions<TRow>): TableHandle<TRow> {
  let data = initialData;
  let uncontrolledValue = initialData.defaultValue;
  let currentActiveId = initialData.activeId;
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
  const bodyHeight = (): number => Math.max(0, viewportSize().height - 2);
  const isControlled = (): boolean => Object.hasOwn(data, 'value');
  const selectedValue = (): string | undefined => (isControlled() ? data.value : uncontrolledValue);

  let focusScope = createFocusScope({ items: data.rows });

  const initialValue = selectedValue();

  let selection = createSelectionModel({
    defaultSelectedIds: initialValue === undefined ? [] : [initialValue],
    items: data.rows,
  });
  let scrollArea = createScrollArea({
    contentSize: data.rows.length,
    viewportSize: bodyHeight(),
  });

  const render = (): void => {
    const dimensions = viewportSize();
    const value = selectedValue();

    scrollArea.setSizes({
      contentSize: data.rows.length,
      viewportSize: Math.max(0, dimensions.height - 2),
    });
    offset = scrollArea.scrollTo(offset);
    element.setContent(
      renderTable({
        ...(currentActiveId === undefined ? {} : { activeId: currentActiveId }),
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        columns: data.columns,
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        height: dimensions.height,
        offset,
        rows: data.rows,
        ...(value === undefined ? {} : { selectedId: value }),
        width: dimensions.width,
      }),
    );
  };
  const ensureActiveVisible = (): void => {
    const index = data.rows.findIndex(({ id }) => id === currentActiveId);
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

    return index >= data.rows.length ? undefined : index;
  };
  const focusAtIndex = (index: number): string | undefined => {
    const row = data.rows[index];

    return row === undefined ? currentActiveId : setActive(focusScope.focus(row.id));
  };
  const focusNearest = (index: number, direction: 'backward' | 'forward'): string | undefined => {
    const step = direction === 'forward' ? 1 : -1;

    for (
      let candidateIndex = index;
      candidateIndex >= 0 && candidateIndex < data.rows.length;
      candidateIndex += step
    ) {
      const candidate = data.rows[candidateIndex];

      if (candidate?.disabled !== true) {
        return focusAtIndex(candidateIndex);
      }
    }

    return currentActiveId;
  };
  const rebuildModels = (): void => {
    const previousActiveId = currentActiveId;

    focusScope = createFocusScope({
      ...(data.activeId === undefined ? {} : { initialFocusId: data.activeId }),
      items: data.rows,
    });
    currentActiveId = focusScope.activate();

    if (
      data.activeId === undefined &&
      previousActiveId !== undefined &&
      data.rows.some(({ disabled, id }) => id === previousActiveId && disabled !== true)
    ) {
      currentActiveId = focusScope.focus(previousActiveId);
    }

    const currentValue = selectedValue();

    selection = createSelectionModel({
      defaultSelectedIds: currentValue === undefined ? [] : [currentValue],
      items: data.rows,
    });
    scrollArea = createScrollArea({
      contentSize: data.rows.length,
      offset,
      viewportSize: bodyHeight(),
    });
    ensureActiveVisible();
  };

  focusScope.activate();
  currentActiveId = focusScope.focus(currentActiveId ?? '') ?? focusScope.current();
  ensureActiveVisible();
  render();

  const handle: TableHandle<TRow> = {
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
    last: () => focusNearest(data.rows.length - 1, 'backward'),
    next: () => move('next'),
    pageBackward() {
      const nextOffset = scrollArea.pageBackward();

      return focusNearest(nextOffset, 'backward');
    },
    pageForward() {
      const nextOffset = scrollArea.pageForward();
      const index = Math.min(data.rows.length - 1, nextOffset);

      return focusNearest(index, 'forward');
    },
    previous: () => move('previous'),
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

    const row = data.rows[index];

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
