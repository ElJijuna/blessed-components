import blessed from 'blessed';

import {
  type NavigationListCharacters,
  type NavigationListItem,
  renderNavigationList,
} from '@/components/navigation/navigation-list/index.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import { createSelectionModel } from '@/primitives/selection/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the NavigationList adapter. */
export type NavigationListBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;

/** Stateful data accepted by the Blessed {@link navigationList} adapter. */
export interface NavigationListData<TItem extends NavigationListItem = NavigationListItem> {
  /** Text inserted between a label and badge. */
  badgeSeparator?: string;

  /** Character tokens used by the pure renderer. */
  characters?: NavigationListCharacters;

  /** Initial active target for uncontrolled usage. Ignored when `value` is supplied. */
  defaultValue?: string;

  /** Text displayed when no targets exist. */
  emptyText?: string;

  /** Preferred initial focus identifier. */
  focusedId?: string;

  /** Ordered targets. Disabled targets are visible but not interactive. */
  items: readonly TItem[];

  /** Called when Enter, Space, click, or {@link NavigationListHandle.activateFocused} selects. */
  onValueChange?: (value: string) => void;

  /** Called after focus moves to a different enabled target. */
  onFocusedIdChange?: (focusedId: string) => void;

  /** Controlled active target identifier. */
  value?: string;
}

/** Options accepted by the Blessed {@link navigationList} adapter. */
export interface NavigationListOptions<TItem extends NavigationListItem = NavigationListItem> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: NavigationListBoxOptions;

  /** Targets, controlled or uncontrolled value, and change listeners. */
  data: NavigationListData<TItem>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link navigationList}. */
export interface NavigationListHandle<TItem extends NavigationListItem = NavigationListItem>
  extends BlessedComponentHandle<NavigationListData<TItem>, blessed.Widgets.BoxElement> {
  /** Activates the focused target or emits a controlled activation request. */
  activateFocused(): string | undefined;

  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Moves focus to an enabled target identifier. */
  focusItem(id: string): string | undefined;

  /** Returns the currently focused target identifier. */
  focusedId(): string | undefined;

  /** Moves focus to the first enabled target. */
  first(): string | undefined;

  /** Moves focus to the last enabled target. */
  last(): string | undefined;

  /** Moves focus to the next enabled target, wrapping at the end. */
  next(): string | undefined;

  /** Moves focus one viewport page backward. */
  pageBackward(): string | undefined;

  /** Moves focus one viewport page forward. */
  pageForward(): string | undefined;

  /** Moves focus to the previous enabled target, wrapping at the start. */
  previous(): string | undefined;

  /** Returns the current controlled or uncontrolled active target identifier. */
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

/** Creates an interactive route NavigationList backed by a Blessed box. */
export function navigationList<TItem extends NavigationListItem>({
  box,
  data: initialData,
  parent,
}: NavigationListOptions<TItem>): NavigationListHandle<TItem> {
  let data = initialData;
  let uncontrolledValue = initialData.defaultValue;
  let currentFocusedId = initialData.focusedId;
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
  const isControlled = (): boolean => Object.hasOwn(data, 'value');
  const selectedValue = (): string | undefined => (isControlled() ? data.value : uncontrolledValue);
  const initialValue = selectedValue();

  let focusScope = createFocusScope({ items: data.items });
  let selection = createSelectionModel({
    defaultSelectedIds: initialValue === undefined ? [] : [initialValue],
    items: data.items,
  });
  let scrollArea = createScrollArea({
    contentSize: data.items.length,
    viewportSize: viewportSize().height,
  });

  const render = (): void => {
    const dimensions = viewportSize();
    const value = selectedValue();

    scrollArea.setSizes({
      contentSize: data.items.length,
      viewportSize: dimensions.height,
    });
    offset = scrollArea.scrollTo(offset);
    element.setContent(
      renderNavigationList({
        ...(value === undefined ? {} : { activeId: value }),
        ...(data.badgeSeparator === undefined ? {} : { badgeSeparator: data.badgeSeparator }),
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        ...(currentFocusedId === undefined ? {} : { focusedId: currentFocusedId }),
        height: dimensions.height,
        items: data.items,
        offset,
        width: dimensions.width,
      }),
    );
  };
  const ensureFocusedVisible = (): void => {
    const index = data.items.findIndex(({ id }) => id === currentFocusedId);
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
  const setFocused = (id: string | undefined): string | undefined => {
    if (id === undefined || id === currentFocusedId) {
      return currentFocusedId;
    }

    currentFocusedId = id;
    ensureFocusedVisible();
    data.onFocusedIdChange?.(id);
    render();

    return currentFocusedId;
  };
  const move = (direction: 'next' | 'previous'): string | undefined =>
    setFocused(focusScope[direction]());
  const itemIndexAtY = (screenY: number): number | undefined => {
    const row = screenY - absoluteElementTop(element) - numericDimension(element.itop);

    if (!Number.isInteger(row) || row < 0 || row >= viewportSize().height) {
      return undefined;
    }

    const index = offset + row;

    return index >= data.items.length ? undefined : index;
  };
  const focusAtIndex = (index: number): string | undefined => {
    const item = data.items[index];

    return item === undefined ? currentFocusedId : setFocused(focusScope.focus(item.id));
  };
  const focusNearest = (index: number, direction: 'backward' | 'forward'): string | undefined => {
    const step = direction === 'forward' ? 1 : -1;

    for (
      let candidateIndex = index;
      candidateIndex >= 0 && candidateIndex < data.items.length;
      candidateIndex += step
    ) {
      const candidate = data.items[candidateIndex];

      if (candidate?.disabled !== true) {
        return focusAtIndex(candidateIndex);
      }
    }

    return currentFocusedId;
  };
  const rebuildModels = (): void => {
    const previousFocusedId = currentFocusedId;
    const value = selectedValue();

    focusScope = createFocusScope({
      ...(data.focusedId === undefined ? {} : { initialFocusId: data.focusedId }),
      items: data.items,
    });
    selection = createSelectionModel({
      defaultSelectedIds: value === undefined ? [] : [value],
      items: data.items,
    });
    scrollArea = createScrollArea({
      contentSize: data.items.length,
      viewportSize: viewportSize().height,
    });
    currentFocusedId = focusScope.activate();

    if (
      data.focusedId === undefined &&
      previousFocusedId !== undefined &&
      data.items.some(({ disabled, id }) => id === previousFocusedId && disabled !== true)
    ) {
      currentFocusedId = focusScope.focus(previousFocusedId);
    }

    ensureFocusedVisible();
  };

  focusScope.activate();
  currentFocusedId = focusScope.focus(currentFocusedId ?? '') ?? focusScope.current();
  render();

  const handle: NavigationListHandle<TItem> = {
    activateFocused() {
      const focusedItem = data.items.find(
        ({ disabled, id }) => id === currentFocusedId && disabled !== true,
      );

      if (focusedItem === undefined) {
        return undefined;
      }

      if (isControlled()) {
        data.onValueChange?.(focusedItem.id);

        return focusedItem.id;
      }

      if (!isControlled()) {
        if (selection.select(focusedItem.id)) {
          uncontrolledValue = focusedItem.id;
          data.onValueChange?.(focusedItem.id);
          render();
        }
      }

      return focusedItem.id;
    },
    destroy() {
      element.destroy();
    },
    element,
    first: () => focusNearest(0, 'forward'),
    focus() {
      element.focus();
    },
    focusedId: () => currentFocusedId,
    focusItem: (id) => setFocused(focusScope.focus(id)),
    last: () => focusNearest(data.items.length - 1, 'backward'),
    next: () => move('next'),
    pageBackward() {
      const { height } = viewportSize();

      offset = scrollArea.pageBackward();

      return focusAtIndex(offset + Math.max(0, height - 1));
    },
    pageForward() {
      offset = scrollArea.pageForward();

      return focusAtIndex(offset);
    },
    previous: () => move('previous'),
    setData(nextData) {
      data = nextData;

      if (isControlled()) {
        uncontrolledValue = undefined;
      } else if (
        uncontrolledValue !== undefined &&
        !data.items.some(({ disabled, id }) => id === uncontrolledValue && disabled !== true)
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
        handle.activateFocused();
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

    const index = itemIndexAtY(event.y);

    if (index === undefined) {
      return;
    }

    const item = data.items[index];

    if (item === undefined || item.disabled === true) {
      return;
    }

    setFocused(focusScope.focus(item.id));
    handle.activateFocused();
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
