import {
  type MenuCharacters,
  type MenuItem,
  renderMenu,
} from '@/components/navigation/menu/index.js';
import {
  type MenuBarCharacters,
  type MenuBarItem,
  renderMenuBar,
} from '@/components/navigation/menu-bar/index.js';
import { truncateText } from '@/core/truncate.js';

/** One top-level dropdown menu with nested actions. */
export interface DropdownMenuItem<TAction extends MenuItem = MenuItem> extends MenuBarItem {
  /** Actions shown when this top-level menu is open. */
  items: readonly TAction[];
}

/** Character tokens used by {@link renderDropdownMenu}. */
export interface DropdownMenuCharacters {
  /** Top-level menu bar characters. */
  menuBar?: MenuBarCharacters;

  /** Open dropdown action characters. */
  menu?: MenuCharacters;
}

/** Options accepted by {@link renderDropdownMenu}. */
export interface RenderDropdownMenuOptions<TAction extends MenuItem = MenuItem> {
  /** Identifier receiving the visible focused action marker inside open menu. */
  activeItemId?: string;

  /** Character tokens for menu bar and menu rows. */
  characters?: DropdownMenuCharacters;

  /** Text returned when no top-level menus exist. */
  emptyText?: string;

  /** Identifier receiving top-level focus marker. */
  focusedId?: string;

  /** Maximum rendered rows. First row is always menu bar. */
  height: number;

  /** Ordered top-level menus. Caller-owned data is never mutated. */
  items: readonly DropdownMenuItem<TAction>[];

  /** Maximum open dropdown rows. Defaults to remaining height. */
  menuHeight?: number;

  /** First rendered dropdown action index. */
  menuOffset?: number;

  /** Open top-level menu identifier. */
  openId?: string;

  /** Text inserted between top-level menus. */
  separator?: string;

  /** Text inserted between action label and shortcut. */
  shortcutSeparator?: string;

  /** Maximum terminal-cell width of each row. */
  width: number;
}

function assertDimensions(
  height: number,
  width: number,
  menuHeight: number | undefined,
  menuOffset: number,
): void {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    (menuHeight !== undefined && (!Number.isInteger(menuHeight) || menuHeight < 0)) ||
    !Number.isInteger(menuOffset) ||
    menuOffset < 0
  ) {
    throw new RangeError(
      'DropdownMenu height, width, menuHeight, and menuOffset must be non-negative integers.',
    );
  }
}

/** Renders a menu bar plus one optional dropdown menu. */
export function renderDropdownMenu<TAction extends MenuItem = MenuItem>({
  activeItemId,
  characters,
  emptyText = 'No menus',
  focusedId,
  height,
  items,
  menuHeight,
  menuOffset = 0,
  openId,
  separator,
  shortcutSeparator,
  width,
}: RenderDropdownMenuOptions<TAction>): string {
  assertDimensions(height, width, menuHeight, menuOffset);

  if (height === 0) {
    return '';
  }

  const bar = renderMenuBar({
    ...(characters?.menuBar === undefined ? {} : { characters: characters.menuBar }),
    emptyText,
    ...(focusedId === undefined ? {} : { focusedId }),
    items,
    ...(openId === undefined ? {} : { activeId: openId }),
    ...(separator === undefined ? {} : { separator }),
    width,
  });
  const openMenu = items.find(({ id }) => id === openId && id !== undefined);

  if (openMenu === undefined) {
    return bar;
  }

  const availableMenuHeight = Math.max(0, height - 1);
  const resolvedMenuHeight = Math.min(menuHeight ?? availableMenuHeight, availableMenuHeight);

  if (resolvedMenuHeight === 0) {
    return bar;
  }

  const renderedMenu = renderMenu({
    ...(activeItemId === undefined ? {} : { activeId: activeItemId }),
    ...(characters?.menu === undefined ? {} : { characters: characters.menu }),
    height: resolvedMenuHeight,
    items: openMenu.items,
    offset: menuOffset,
    ...(shortcutSeparator === undefined ? {} : { shortcutSeparator }),
    width,
  });

  return `${bar}\n${renderedMenu
    .split('\n')
    .map((line) => truncateText(line, width))
    .join('\n')}`;
}
