import blessed from 'blessed';

import {
  type MenuBarCharacters,
  type MenuBarItem,
  renderMenuBar,
} from '@/components/navigation/menu-bar/index.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { createSelectionModel } from '@/primitives/selection/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the MenuBar adapter. */
export type MenuBarBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link menuBar} adapter. */
export interface MenuBarData<TItem extends MenuBarItem = MenuBarItem> {
  /** Preferred initial focus identifier. */
  activeId?: string;

  /** Character tokens used by the pure renderer. */
  characters?: MenuBarCharacters;

  /** Initial active/open menu for uncontrolled usage. Ignored when `value` is supplied. */
  defaultValue?: string;

  /** Text displayed when no menus exist. */
  emptyText?: string;

  /** Ordered top-level menus. Disabled menus are visible but not interactive. */
  items: readonly TItem[];

  /** Called when Enter, Space, or {@link MenuBarHandle.activateFocused} requests activation. */
  onActivate?: (value: string) => void;

  /** Called after focus moves to a different enabled menu. */
  onActiveIdChange?: (activeId: string) => void;

  /** Text inserted between rendered menus. */
  separator?: string;

  /** Controlled active/open menu identifier. */
  value?: string;
}

/** Options accepted by the Blessed {@link menuBar} adapter. */
export interface MenuBarOptions<TItem extends MenuBarItem = MenuBarItem> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: MenuBarBoxOptions;

  /** Menus, controlled or uncontrolled value, and change listeners. */
  data: MenuBarData<TItem>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link menuBar}. */
export interface MenuBarHandle<TItem extends MenuBarItem = MenuBarItem>
  extends BlessedComponentHandle<MenuBarData<TItem>, blessed.Widgets.BoxElement> {
  /** Activates the focused menu or emits a controlled activation request. */
  activateFocused(): string | undefined;

  /** Returns the currently focused menu identifier. */
  activeId(): string | undefined;

  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Moves focus to an enabled menu identifier. */
  focusItem(id: string): string | undefined;

  /** Moves focus to the first enabled menu. */
  first(): string | undefined;

  /** Moves focus to the last enabled menu. */
  last(): string | undefined;

  /** Moves focus to the next enabled menu, wrapping at the end. */
  next(): string | undefined;

  /** Moves focus to the previous enabled menu, wrapping at the start. */
  previous(): string | undefined;

  /** Returns the current controlled or uncontrolled active/open menu identifier. */
  value(): string | undefined;
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates an interactive horizontal MenuBar backed by a Blessed box. */
export function menuBar<TItem extends MenuBarItem>({
  box,
  data: initialData,
  parent,
}: MenuBarOptions<TItem>): MenuBarHandle<TItem> {
  let data = initialData;
  let uncontrolledValue = initialData.defaultValue;
  let currentActiveId = initialData.activeId;

  const element = blessed.box({
    keys: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const width = (): number =>
    Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth));
  const isControlled = (): boolean => Object.hasOwn(data, 'value');
  const selectedValue = (): string | undefined => (isControlled() ? data.value : uncontrolledValue);
  const initialValue = selectedValue();

  let focusScope = createFocusScope({ items: data.items });
  let selection = createSelectionModel({
    defaultSelectedIds: initialValue === undefined ? [] : [initialValue],
    items: data.items,
  });

  const render = (): void => {
    const value = selectedValue();

    element.setContent(
      renderMenuBar({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        ...(currentActiveId === undefined ? {} : { focusedId: currentActiveId }),
        items: data.items,
        ...(data.separator === undefined ? {} : { separator: data.separator }),
        ...(value === undefined ? {} : { activeId: value }),
        width: width(),
      }),
    );
  };
  const setActive = (id: string | undefined): string | undefined => {
    if (id === undefined || id === currentActiveId) {
      return currentActiveId;
    }

    currentActiveId = id;
    data.onActiveIdChange?.(id);
    render();

    return currentActiveId;
  };
  const move = (direction: 'next' | 'previous'): string | undefined =>
    setActive(focusScope[direction]());
  const focusNearest = (index: number, direction: 'backward' | 'forward'): string | undefined => {
    const step = direction === 'forward' ? 1 : -1;

    for (
      let candidateIndex = index;
      candidateIndex >= 0 && candidateIndex < data.items.length;
      candidateIndex += step
    ) {
      const candidate = data.items[candidateIndex];

      if (candidate?.disabled !== true) {
        return candidate === undefined
          ? currentActiveId
          : setActive(focusScope.focus(candidate.id));
      }
    }

    return currentActiveId;
  };
  const rebuildModels = (): void => {
    const previousActiveId = currentActiveId;

    focusScope = createFocusScope({
      ...(data.activeId === undefined ? {} : { initialFocusId: data.activeId }),
      items: data.items,
    });
    currentActiveId = focusScope.activate();

    if (
      data.activeId === undefined &&
      previousActiveId !== undefined &&
      data.items.some(({ disabled, id }) => id === previousActiveId && disabled !== true)
    ) {
      currentActiveId = focusScope.focus(previousActiveId);
    }

    const currentValue = selectedValue();

    selection = createSelectionModel({
      defaultSelectedIds: currentValue === undefined ? [] : [currentValue],
      items: data.items,
    });
  };

  focusScope.activate();
  currentActiveId = focusScope.focus(currentActiveId ?? '') ?? focusScope.current();
  render();

  const handle: MenuBarHandle<TItem> = {
    activateFocused() {
      if (currentActiveId === undefined) {
        return undefined;
      }

      if (isControlled()) {
        data.onActivate?.(currentActiveId);

        return currentActiveId;
      }

      if (selection.select(currentActiveId)) {
        uncontrolledValue = currentActiveId;
        data.onActivate?.(currentActiveId);
        render();
      }

      return currentActiveId;
    },
    activeId: () => currentActiveId,
    destroy() {
      element.destroy();
    },
    element,
    first: () => focusNearest(0, 'forward'),
    focus() {
      element.focus();
    },
    focusItem: (id) => setActive(focusScope.focus(id)),
    last: () => focusNearest(data.items.length - 1, 'backward'),
    next: () => move('next'),
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
      case 'left':
        handle.previous();
        break;
      case 'right':
        handle.next();
        break;
    }
  });
  element.on('wheeldown', () => {
    handle.next();
  });
  element.on('wheelup', () => {
    handle.previous();
  });
  element.on('resize', render);

  return handle;
}
