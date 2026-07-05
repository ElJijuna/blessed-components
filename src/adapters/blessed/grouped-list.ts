import blessed from 'blessed';

import {
  flattenGroupedListRows,
  type GroupedListCharacters,
  type GroupedListItem,
  type GroupedListSection,
  renderGroupedList,
} from '@/components/collections/grouped-list/index.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import { createSelectionModel } from '@/primitives/selection/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the GroupedList adapter. */
export type GroupedListBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link groupedList} adapter. */
export interface GroupedListData<TItem extends GroupedListItem = GroupedListItem> {
  /** Preferred initial cursor identifier. */
  activeId?: string;

  /** Character tokens used by the pure renderer. */
  characters?: GroupedListCharacters;

  /** Initial selection for uncontrolled usage. Ignored when `value` is supplied. */
  defaultValue?: string;

  /** Text displayed when no rows exist. */
  emptyText?: string;

  /** Spaces inserted before item rows. @defaultValue `2` */
  indent?: number;

  /** Ordered sections. Disabled items are visible but not interactive. */
  sections: readonly GroupedListSection<TItem>[];

  /** Called after the cursor moves to a different enabled item. */
  onActiveIdChange?: (activeId: string) => void;

  /** Called when Enter or {@link GroupedListHandle.selectActive} requests selection. */
  onValueChange?: (value: string) => void;

  /** Controlled selected identifier. */
  value?: string;
}

/** Options accepted by the Blessed {@link groupedList} adapter. */
export interface GroupedListOptions<TItem extends GroupedListItem = GroupedListItem> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: GroupedListBoxOptions;

  /** Sections, controlled or uncontrolled value, and change listeners. */
  data: GroupedListData<TItem>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link groupedList}. */
export interface GroupedListHandle<TItem extends GroupedListItem = GroupedListItem>
  extends BlessedComponentHandle<GroupedListData<TItem>, blessed.Widgets.BoxElement> {
  /** Returns the current enabled cursor identifier. */
  activeId(): string | undefined;

  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Moves the cursor to an enabled identifier. */
  focusItem(id: string): string | undefined;

  /** Moves the cursor to the first enabled item. */
  first(): string | undefined;

  /** Moves the cursor to the last enabled item. */
  last(): string | undefined;

  /** Moves the cursor to the next enabled item, wrapping at the end. */
  next(): string | undefined;

  /** Moves the cursor one viewport page backward. */
  pageBackward(): string | undefined;

  /** Moves the cursor one viewport page forward. */
  pageForward(): string | undefined;

  /** Moves the cursor to the previous enabled item, wrapping at the start. */
  previous(): string | undefined;

  /** Selects the active item or emits a controlled selection request. */
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

function sectionItems<TItem extends GroupedListItem>(
  sections: readonly GroupedListSection<TItem>[],
): readonly TItem[] {
  return sections.flatMap((section) => section.items);
}

/** Creates an interactive grouped single-selection list backed by a Blessed box. */
export function groupedList<TItem extends GroupedListItem>({
  box,
  data: initialData,
  parent,
}: GroupedListOptions<TItem>): GroupedListHandle<TItem> {
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
  const rows = () => flattenGroupedListRows({ sections: data.sections });
  const items = () => sectionItems(data.sections);
  const isControlled = (): boolean => Object.hasOwn(data, 'value');
  const selectedValue = (): string | undefined => (isControlled() ? data.value : uncontrolledValue);
  const initialValue = selectedValue();

  let focusScope = createFocusScope({ items: items() });
  let selection = createSelectionModel({
    defaultSelectedIds: initialValue === undefined ? [] : [initialValue],
    items: items(),
  });
  let scrollArea = createScrollArea({
    contentSize: rows().length,
    viewportSize: viewportSize().height,
  });

  const rowIndexForItem = (id: string | undefined): number =>
    rows().findIndex((row) => row.type === 'item' && row.item.id === id);
  const render = (): void => {
    const dimensions = viewportSize();
    const value = selectedValue();

    scrollArea.setSizes({
      contentSize: rows().length,
      viewportSize: dimensions.height,
    });
    offset = scrollArea.scrollTo(offset);
    element.setContent(
      renderGroupedList({
        ...(currentActiveId === undefined ? {} : { activeId: currentActiveId }),
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        height: dimensions.height,
        ...(data.indent === undefined ? {} : { indent: data.indent }),
        offset,
        sections: data.sections,
        ...(value === undefined ? {} : { selectedId: value }),
        width: dimensions.width,
      }),
    );
  };
  const ensureActiveVisible = (): void => {
    const index = rowIndexForItem(currentActiveId);
    const { height } = viewportSize();

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

    if (!Number.isInteger(row) || row < 0 || row >= viewportSize().height) {
      return undefined;
    }

    const index = offset + row;

    return index >= rows().length ? undefined : index;
  };
  const focusNearestRow = (
    rowIndex: number,
    direction: 'backward' | 'forward',
  ): string | undefined => {
    const step = direction === 'forward' ? 1 : -1;
    const allRows = rows();

    for (
      let candidateIndex = rowIndex;
      candidateIndex >= 0 && candidateIndex < allRows.length;
      candidateIndex += step
    ) {
      const candidate = allRows[candidateIndex];

      if (candidate?.type === 'item' && candidate.item.disabled !== true) {
        return setActive(focusScope.focus(candidate.item.id));
      }
    }

    return currentActiveId;
  };
  const rebuildModels = (): void => {
    const previousActiveId = currentActiveId;
    const interactiveItems = items();

    focusScope = createFocusScope({
      ...(data.activeId === undefined ? {} : { initialFocusId: data.activeId }),
      items: interactiveItems,
    });
    currentActiveId = focusScope.activate();

    if (
      data.activeId === undefined &&
      previousActiveId !== undefined &&
      interactiveItems.some(({ disabled, id }) => id === previousActiveId && disabled !== true)
    ) {
      currentActiveId = focusScope.focus(previousActiveId);
    }

    const currentValue = selectedValue();

    selection = createSelectionModel({
      defaultSelectedIds: currentValue === undefined ? [] : [currentValue],
      items: interactiveItems,
    });
    scrollArea = createScrollArea({
      contentSize: rows().length,
      offset,
      viewportSize: viewportSize().height,
    });
    ensureActiveVisible();
  };

  focusScope.activate();
  currentActiveId = focusScope.focus(currentActiveId ?? '') ?? focusScope.current();
  ensureActiveVisible();
  render();

  const handle: GroupedListHandle<TItem> = {
    activeId: () => currentActiveId,
    destroy() {
      element.destroy();
    },
    element,
    first: () => focusNearestRow(0, 'forward'),
    focus() {
      element.focus();
    },
    focusItem: (id) => setActive(focusScope.focus(id)),
    last: () => focusNearestRow(rows().length - 1, 'backward'),
    next: () => move('next'),
    pageBackward() {
      const nextOffset = scrollArea.pageBackward();

      return focusNearestRow(nextOffset, 'backward');
    },
    pageForward() {
      const nextOffset = scrollArea.pageForward();

      return focusNearestRow(nextOffset, 'forward');
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
        !items().some(({ disabled, id }) => id === uncontrolledValue && disabled !== true)
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

    const row = rows()[index];

    if (row?.type !== 'item' || row.item.disabled === true) {
      return;
    }

    setActive(focusScope.focus(row.item.id));
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
