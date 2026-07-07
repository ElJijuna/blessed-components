import blessed from 'blessed';

import {
  type DropdownMenuCharacters,
  type DropdownMenuItem,
  renderDropdownMenu,
} from '@/components/navigation/dropdown-menu/index.js';
import type { MenuItem } from '@/components/navigation/menu/index.js';
import { visibleWidth } from '@/core/width.js';
import { createFocusScope } from '@/primitives/focus-scope/index.js';
import { createScrollArea } from '@/primitives/scroll-area/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by DropdownMenu adapter. */
export type DropdownMenuBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;

/** Stateful data accepted by Blessed {@link dropdownMenu} adapter. */
export interface DropdownMenuData<TAction extends MenuItem = MenuItem> {
  /** Preferred focused action id inside open menu. */
  activeItemId?: string;

  /** Character tokens used by pure renderer. */
  characters?: DropdownMenuCharacters;

  /** Preferred focused top-level menu id. */
  focusedId?: string;

  /** Ordered top-level menus. Disabled menus/actions are visible but skipped. */
  items: readonly DropdownMenuItem<TAction>[];

  /** Called when action activates. */
  onAction?: (menuId: string, item: TAction) => void;

  /** Called after focused action changes. */
  onActiveItemIdChange?: (itemId: string) => void;

  /** Called after focused top-level menu changes. */
  onFocusedIdChange?: (menuId: string) => void;

  /** Called when open menu changes. */
  onOpenIdChange?: (openId: string | undefined) => void;

  /** Controlled open menu id. */
  openId?: string;

  /** Text inserted between top-level menus. */
  separator?: string;

  /** Text inserted between action label and shortcut. */
  shortcutSeparator?: string;
}

/** Options accepted by Blessed {@link dropdownMenu} adapter. */
export interface DropdownMenuOptions<TAction extends MenuItem = MenuItem> {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: DropdownMenuBoxOptions;

  /** Menu tree, state, and callbacks. */
  data: DropdownMenuData<TAction>;

  /** Blessed screen or node receiving created box. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link dropdownMenu}. */
export interface DropdownMenuHandle<TAction extends MenuItem = MenuItem>
  extends BlessedComponentHandle<DropdownMenuData<TAction>, blessed.Widgets.BoxElement> {
  /** Activates focused action. */
  activateActive(): TAction | undefined;

  /** Returns focused action id. */
  activeItemId(): string | undefined;

  /** Closes open menu. */
  close(): void;

  /** Returns focused top-level menu id. */
  focusedId(): string | undefined;

  /** Gives terminal focus to owned box. */
  focus(): void;

  /** Moves focus to top-level menu id. */
  focusMenu(id: string): string | undefined;

  /** Returns open menu id. */
  openId(): string | undefined;

  /** Opens focused menu or specific menu id. */
  open(id?: string): string | undefined;
}

interface Keypress {
  full?: string;
  name?: string;
}

interface MouseEvent {
  x?: number;
  y?: number;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function absoluteElementLeft(element: blessed.Widgets.BoxElement): number {
  const positionedElement = element as blessed.Widgets.BoxElement & {
    aleft?: blessed.Widgets.Types.TPosition;
  };

  return numericDimension(positionedElement.aleft ?? positionedElement.left);
}

function absoluteElementTop(element: blessed.Widgets.BoxElement): number {
  const positionedElement = element as blessed.Widgets.BoxElement & {
    atop?: blessed.Widgets.Types.TPosition;
  };

  return numericDimension(positionedElement.atop ?? positionedElement.top);
}

function itemAtX<TAction extends MenuItem>(
  items: readonly DropdownMenuItem<TAction>[],
  x: number,
  separatorWidth: number,
): DropdownMenuItem<TAction> | undefined {
  let start = 0;

  for (const item of items) {
    const width = visibleWidth(item.label) + 3;
    const end = start + width;

    if (x >= start && x < end) {
      return item;
    }

    start = end + separatorWidth;
  }

  return undefined;
}

/** Creates interactive dropdown menu backed by one Blessed box. */
export function dropdownMenu<TAction extends MenuItem>({
  box,
  data: initialData,
  parent,
}: DropdownMenuOptions<TAction>): DropdownMenuHandle<TAction> {
  const {
    activeItemId: initialActiveItemId,
    focusedId: initialFocusedId,
    openId: initialOpenId,
  } = initialData;

  let data = initialData;
  let focusedId = initialFocusedId;
  let uncontrolledOpenId = initialOpenId;
  let activeItemId = initialActiveItemId;
  let menuOffset = 0;

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
  const openId = (): string | undefined => data.openId ?? uncontrolledOpenId;
  const openMenu = (): DropdownMenuItem<TAction> | undefined =>
    data.items.find(({ id }) => id === openId());
  const openActions = (): readonly TAction[] => openMenu()?.items ?? [];

  let menuFocus = createFocusScope({ items: data.items });
  let actionFocus = createFocusScope({ items: openActions() });
  let scrollArea = createScrollArea({
    contentSize: openActions().length,
    viewportSize: Math.max(0, viewportSize().height - 1),
  });

  const setOpen = (id: string | undefined): string | undefined => {
    if (data.openId === undefined) {
      uncontrolledOpenId = id;
    }

    data.onOpenIdChange?.(id);
    rebuildActionModels();
    render();

    return openId();
  };
  const render = (): void => {
    const size = viewportSize();
    const currentOpenId = openId();

    scrollArea.setSizes({
      contentSize: openActions().length,
      viewportSize: Math.max(0, size.height - 1),
    });
    menuOffset = scrollArea.scrollTo(menuOffset);
    element.setContent(
      renderDropdownMenu({
        ...(activeItemId === undefined ? {} : { activeItemId }),
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        ...(focusedId === undefined ? {} : { focusedId }),
        height: size.height,
        items: data.items,
        menuOffset,
        ...(currentOpenId === undefined ? {} : { openId: currentOpenId }),
        ...(data.separator === undefined ? {} : { separator: data.separator }),
        ...(data.shortcutSeparator === undefined
          ? {}
          : { shortcutSeparator: data.shortcutSeparator }),
        width: size.width,
      }),
    );
  };
  const setFocused = (id: string | undefined): string | undefined => {
    if (id === undefined || id === focusedId) {
      return focusedId;
    }

    focusedId = id;
    data.onFocusedIdChange?.(id);
    render();

    return focusedId;
  };

  function rebuildActionModels(): void {
    const previousActiveId = activeItemId;

    actionFocus = createFocusScope({
      ...(data.activeItemId === undefined ? {} : { initialFocusId: data.activeItemId }),
      items: openActions(),
    });
    scrollArea = createScrollArea({
      contentSize: openActions().length,
      offset: menuOffset,
      viewportSize: Math.max(0, viewportSize().height - 1),
    });
    activeItemId = actionFocus.activate();

    if (
      data.activeItemId === undefined &&
      previousActiveId !== undefined &&
      openActions().some(({ disabled, id }) => id === previousActiveId && disabled !== true)
    ) {
      activeItemId = actionFocus.focus(previousActiveId);
    }
  }

  const focusMenu = (id: string): string | undefined => setFocused(menuFocus.focus(id));
  const focusAction = (id: string | undefined): string | undefined => {
    if (id === undefined || id === activeItemId) {
      return activeItemId;
    }

    activeItemId = id;
    data.onActiveItemIdChange?.(id);
    render();

    return activeItemId;
  };
  const moveAction = (direction: 'next' | 'previous'): string | undefined =>
    focusAction(actionFocus[direction]());

  menuFocus.activate();
  focusedId = menuFocus.focus(focusedId ?? '') ?? menuFocus.current();
  rebuildActionModels();
  render();

  const handle: DropdownMenuHandle<TAction> = {
    activateActive() {
      const menu = openMenu();
      const item = openActions().find(({ disabled, id }) => id === activeItemId && !disabled);

      if (menu === undefined || item === undefined) {
        return undefined;
      }

      data.onAction?.(menu.id, item);
      setOpen(undefined);

      return item;
    },
    activeItemId: () => activeItemId,
    close() {
      setOpen(undefined);
    },
    destroy() {
      element.destroy();
    },
    element,
    focus() {
      element.focus();
    },
    focusedId: () => focusedId,
    focusMenu,
    open(id) {
      const nextOpenId = id ?? focusedId;

      if (nextOpenId === undefined) {
        return openId();
      }

      focusMenu(nextOpenId);

      return setOpen(nextOpenId);
    },
    openId,
    setData(nextData) {
      const previousFocusedId = focusedId;

      data = nextData;
      menuFocus = createFocusScope({
        ...(data.focusedId === undefined ? {} : { initialFocusId: data.focusedId }),
        items: data.items,
      });
      focusedId = menuFocus.activate();
      focusedId =
        data.focusedId === undefined
          ? (menuFocus.focus(previousFocusedId ?? '') ?? focusedId)
          : (menuFocus.focus(data.focusedId) ?? focusedId);
      uncontrolledOpenId = data.openId ?? uncontrolledOpenId;
      rebuildActionModels();
      render();
    },
  };

  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'escape':
        handle.close();
        break;
      case 'left':
        setFocused(menuFocus.previous());

        if (openId() !== undefined) {
          setOpen(focusedId);
        }

        break;
      case 'right':
        setFocused(menuFocus.next());

        if (openId() !== undefined) {
          setOpen(focusedId);
        }

        break;
      case 'down':
        if (openId() === undefined) {
          handle.open();
        } else {
          moveAction('next');
        }

        break;
      case 'up':
        if (openId() !== undefined) {
          moveAction('previous');
        }

        break;
      case 'enter':
      case 'space':
        if (openId() === undefined) {
          handle.open();
        } else {
          handle.activateActive();
        }

        break;
    }
  });
  element.on('click', (event: MouseEvent) => {
    if (event.y === undefined) {
      return;
    }

    const row = event.y - absoluteElementTop(element) - numericDimension(element.itop);

    if (row === 0) {
      const column =
        (event.x ?? absoluteElementLeft(element)) -
        absoluteElementLeft(element) -
        numericDimension(element.ileft);
      const separatorWidth = data.separator === undefined ? 2 : visibleWidth(data.separator);
      const item = itemAtX(data.items, column, separatorWidth);

      if (item !== undefined && item.disabled !== true) {
        focusMenu(item.id);
        setOpen(openId() === item.id ? undefined : item.id);
      }

      return;
    }

    if (row > 0 && openId() !== undefined) {
      const index = menuOffset + row - 1;
      const item = openActions()[index];

      if (item !== undefined && item.disabled !== true) {
        focusAction(actionFocus.focus(item.id));
        handle.activateActive();
      }
    }
  });
  element.on('wheeldown', () => {
    if (openId() !== undefined) {
      moveAction('next');
    }
  });
  element.on('wheelup', () => {
    if (openId() !== undefined) {
      moveAction('previous');
    }
  });
  element.on('resize', render);

  return handle;
}
