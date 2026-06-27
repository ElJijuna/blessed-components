import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Minimum data required for one menu action. */
export interface MenuItem {
  /** Whether navigation and activation must skip this action. */
  disabled?: boolean;

  /** Stable action identifier. */
  id: string;

  /** Human-readable action label. */
  label: string;

  /** Optional visible keyboard shortcut or mnemonic. */
  shortcut?: string;
}

/** Character tokens used by {@link renderMenu}. */
export interface MenuCharacters {
  /** Marker shown beside the focused action. */
  active: string;

  /** Marker shown beside a disabled action. */
  disabled: string;

  /** Marker shown beside an enabled idle action. */
  idle: string;
}

/** Options accepted by {@link renderMenu}. */
export interface RenderMenuOptions<TItem extends MenuItem = MenuItem> {
  /** Identifier receiving the visible focus marker. */
  activeId?: string;

  /** Character tokens used to communicate action state without color. */
  characters?: MenuCharacters;

  /**
   * Text returned when `items` is empty.
   *
   * @defaultValue `'No actions'`
   */
  emptyText?: string;

  /** Maximum number of rendered rows. */
  height: number;

  /** Ordered actions. Caller-owned data is never mutated. */
  items: readonly TItem[];

  /**
   * First rendered action index.
   *
   * @defaultValue `0`
   */
  offset?: number;

  /**
   * Text inserted between a label and shortcut.
   *
   * @defaultValue `'  '`
   */
  shortcutSeparator?: string;

  /** Maximum terminal-cell width of each row. */
  width: number;
}

const DEFAULT_CHARACTERS: MenuCharacters = {
  active: '›',
  disabled: '×',
  idle: ' ',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function assertOneLine(value: string, message: string): void {
  if (value.length === 0 || /[\r\n]/u.test(value)) {
    throw new RangeError(message);
  }
}

function renderMenuRow({
  activeId,
  characters,
  item,
  shortcutSeparator,
  width,
}: {
  activeId: string | undefined;
  characters: MenuCharacters;
  item: MenuItem;
  shortcutSeparator: string;
  width: number;
}): string {
  const label = plainText(item.label);
  const shortcut = item.shortcut === undefined ? undefined : plainText(item.shortcut);

  assertOneLine(item.id, 'Menu item ids must be non-empty and fit on one line.');
  assertOneLine(label, 'Menu item labels must be non-empty and fit on one line.');

  if (shortcut !== undefined) {
    assertOneLine(shortcut, 'Menu item shortcuts must be non-empty and fit on one line.');
  }

  const cursor = item.id === activeId ? characters.active : ' ';
  const state = item.disabled === true ? characters.disabled : characters.idle;
  const prefix = `${cursor} ${state} `;

  if (shortcut === undefined) {
    return truncateText(`${prefix}${label}`, width);
  }

  const base = `${prefix}${label}`;
  const suffix = `${plainText(shortcutSeparator)}${shortcut}`;
  const gap = Math.max(0, width - visibleWidth(base) - visibleWidth(suffix));

  return truncateText(`${base}${' '.repeat(gap)}${suffix}`, width);
}

/**
 * Renders a bounded vertical menu of actions.
 *
 * The renderer exposes focused and disabled states with text markers and keeps
 * shortcuts readable when horizontal space allows.
 *
 * @param options - Actions, focus identifier, viewport dimensions, and characters.
 * @returns Plain text containing at most `height` rows.
 */
export function renderMenu<TItem extends MenuItem>({
  activeId,
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No actions',
  height,
  items,
  offset = 0,
  shortcutSeparator = '  ',
  width,
}: RenderMenuOptions<TItem>): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('Menu dimensions and offset must be non-negative integers.');
  }

  if (items.length === 0) {
    return truncateText(plainText(emptyText), width);
  }

  return items
    .slice(offset, offset + height)
    .map((item) =>
      renderMenuRow({
        activeId,
        characters,
        item,
        shortcutSeparator,
        width,
      }),
    )
    .join('\n');
}
