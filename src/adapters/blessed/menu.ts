import blessed from 'blessed';

import {
  type MenuCharacters,
  type MenuItem,
  renderMenu,
} from '@/components/navigation/menu/index.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Menu adapter. */
export type MenuBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link menu} adapter. */
export interface MenuData<TItem extends MenuItem = MenuItem> {
  /** Preferred initial cursor identifier. */
  activeId?: string;

  /** Character tokens used by the pure renderer. */
  characters?: MenuCharacters;

  /** Text displayed when no actions exist. */
  emptyText?: string;

  /** Ordered actions. Disabled actions are visible but not interactive. */
  items: readonly TItem[];

  /** Called when Enter, Space, or {@link MenuHandle.activateActive} requests activation. */
  onAction?: (item: TItem) => void;

  /** Called after the cursor moves to a different enabled action. */
  onActiveIdChange?: (activeId: string) => void;

  /** Text inserted between a label and shortcut. */
  shortcutSeparator?: string;
}

/** Options accepted by the Blessed {@link menu} adapter. */
export interface MenuOptions<TItem extends MenuItem = MenuItem> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: MenuBoxOptions;

  /** Actions, focus state, and activation listener. */
  data: MenuData<TItem>;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link menu}. */
export interface MenuHandle<TItem extends MenuItem = MenuItem>
  extends BlessedComponentHandle<MenuData<TItem>, blessed.Widgets.BoxElement> {
  /** Activates the focused action. */
  activateActive(): TItem | undefined;

  /** Returns the current enabled cursor identifier. */
  activeId(): string | undefined;

  /** Gives terminal focus to the owned box. */
  focus(): void;

  /** Moves the cursor to an enabled identifier. */
  focusItem(id: string): string | undefined;

  /** Moves the cursor to the first enabled action. */
  first(): string | undefined;

  /** Moves the cursor to the last enabled action. */
  last(): string | undefined;

  /** Moves the cursor to the next enabled action, wrapping at the end. */
  next(): string | undefined;

  /** Moves the cursor one viewport page backward. */
  pageBackward(): string | undefined;

  /** Moves the cursor one viewport page forward. */
  pageForward(): string | undefined;

  /** Moves the cursor to the previous enabled action, wrapping at the start. */
  previous(): string | undefined;
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

/** Creates an interactive action Menu backed by a Blessed box. */
export function menu<TItem extends MenuItem>({
  box,
  data: initialData,
  parent,
}: MenuOptions<TItem>): MenuHandle<TItem> {
  let data = initialData;
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

  let focusScope = createFocusScope({ items: data.items });
  let scrollArea = createScrollArea({
    contentSize: data.items.length,
    viewportSize: viewportSize().height,
  });

  const render = (): void => {
    const dimensions = viewportSize();

    scrollArea.setSizes({
      contentSize: data.items.length,
      viewportSize: dimensions.height,
    });
    offset = scrollArea.scrollTo(offset);
    element.setContent(
      renderMenu({
        ...(currentActiveId === undefined ? {} : { activeId: currentActiveId }),
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(data.emptyText === undefined ? {} : { emptyText: data.emptyText }),
        height: dimensions.height,
        items: data.items,
        offset,
        ...(data.shortcutSeparator === undefined
          ? {}
          : { shortcutSeparator: data.shortcutSeparator }),
        width: dimensions.width,
      }),
    );
  };
  const ensureActiveVisible = (): void => {
    const index = data.items.findIndex(({ id }) => id === currentActiveId);
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

    return item === undefined ? currentActiveId : setActive(focusScope.focus(item.id));
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

    return currentActiveId;
  };
  const rebuildModels = (): void => {
    const previousActiveId = currentActiveId;

    focusScope = createFocusScope({
      ...(data.activeId === undefined ? {} : { initialFocusId: data.activeId }),
      items: data.items,
    });
    scrollArea = createScrollArea({
      contentSize: data.items.length,
      viewportSize: viewportSize().height,
    });
    currentActiveId = focusScope.activate();

    if (
      data.activeId === undefined &&
      previousActiveId !== undefined &&
      data.items.some(({ disabled, id }) => id === previousActiveId && disabled !== true)
    ) {
      currentActiveId = focusScope.focus(previousActiveId);
    }

    ensureActiveVisible();
  };

  focusScope.activate();
  currentActiveId = focusScope.focus(currentActiveId ?? '') ?? focusScope.current();
  render();

  const handle: MenuHandle<TItem> = {
    activateActive() {
      const activeItem = data.items.find(({ disabled, id }) => id === currentActiveId && !disabled);

      if (activeItem === undefined) {
        return undefined;
      }

      data.onAction?.(activeItem);

      return activeItem;
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
      rebuildModels();
      render();
    },
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
        handle.activateActive();
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

    setActive(focusScope.focus(item.id));
    handle.activateActive();
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
