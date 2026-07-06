import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Minimum data required for one top-level menu. */
export interface MenuBarItem {
  /** Whether keyboard navigation and activation must skip this menu. */
  disabled?: boolean;

  /** Stable menu identifier. */
  id: string;

  /** Visible menu label. */
  label: string;
}

/** Character tokens used by {@link renderMenuBar}. */
export interface MenuBarCharacters {
  /** Marker shown before the active menu. */
  active: string;

  /** Marker shown before disabled menus. */
  disabled: string;

  /** Marker shown before the focused menu. */
  focused: string;
}

/** Options accepted by {@link renderMenuBar}. */
export interface RenderMenuBarOptions<TItem extends MenuBarItem = MenuBarItem> {
  /** Identifier rendered as active or open. */
  activeId?: string;

  /** Character tokens for focus, active, and disabled state. */
  characters?: MenuBarCharacters;

  /**
   * Text returned when `items` is empty.
   *
   * @defaultValue `'No menus'`
   */
  emptyText?: string;

  /** Identifier rendered with a focus marker. */
  focusedId?: string;

  /** Ordered top-level menus. Caller-owned data is never mutated. */
  items: readonly TItem[];

  /**
   * Text inserted between top-level menus.
   *
   * @defaultValue `'  '`
   */
  separator?: string;

  /** Maximum terminal-cell width of the rendered line. */
  width: number;
}

const DEFAULT_CHARACTERS: MenuBarCharacters = {
  active: '●',
  disabled: '×',
  focused: '›',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function assertOneLine(value: string, message: string): void {
  if (value.length === 0 || /[\r\n]/u.test(value)) {
    throw new RangeError(message);
  }
}

/**
 * Renders a horizontal top-level menu bar.
 *
 * The renderer keeps focus, active/open, and disabled states visible without
 * requiring color.
 *
 * @param options - Menus, state identifiers, separator, characters, and width.
 * @returns Plain terminal text without ANSI sequences or Blessed tags.
 */
export function renderMenuBar<TItem extends MenuBarItem>({
  activeId,
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No menus',
  focusedId,
  items,
  separator = '  ',
  width,
}: RenderMenuBarOptions<TItem>): string {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('MenuBar width must be a non-negative integer.');
  }

  if (items.length === 0) {
    return truncateText(plainText(emptyText), width);
  }

  const renderedItems = items.map((item) => {
    const label = plainText(item.label);

    assertOneLine(item.id, 'MenuBar item ids must be non-empty and fit on one line.');
    assertOneLine(label, 'MenuBar item labels must be non-empty and fit on one line.');

    const focus = item.id === focusedId ? characters.focused : ' ';
    const state =
      item.disabled === true ? characters.disabled : item.id === activeId ? characters.active : ' ';

    return `${focus}${state} ${label}`;
  });

  return truncateText(renderedItems.join(plainText(separator)), width);
}
