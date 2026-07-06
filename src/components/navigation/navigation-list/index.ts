import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Minimum data required for one navigation target. */
export interface NavigationListItem {
  /** Optional right-aligned count, status, or shortcut text. */
  badge?: string;

  /** Whether keyboard navigation and activation must skip this target. */
  disabled?: boolean;

  /** Stable target identifier. */
  id: string;

  /** Visible target label. */
  label: string;
}

/** Character tokens used by {@link renderNavigationList}. */
export interface NavigationListCharacters {
  /** Marker shown beside the active route or view. */
  active: string;

  /** Marker shown beside disabled targets. */
  disabled: string;

  /** Marker shown beside the focused target. */
  focused: string;

  /** Marker shown beside enabled idle targets. */
  idle: string;
}

/** Options accepted by {@link renderNavigationList}. */
export interface RenderNavigationListOptions<
  TItem extends NavigationListItem = NavigationListItem,
> {
  /** Identifier rendered as the active route or view. */
  activeId?: string;

  /** Character tokens used to communicate state without color. */
  characters?: NavigationListCharacters;

  /**
   * Text returned when `items` is empty.
   *
   * @defaultValue `'No destinations'`
   */
  emptyText?: string;

  /** Identifier receiving the visible focus marker. */
  focusedId?: string;

  /** Maximum number of rendered rows. */
  height: number;

  /** Ordered navigation targets. Caller-owned data is never mutated. */
  items: readonly TItem[];

  /**
   * First rendered target index.
   *
   * @defaultValue `0`
   */
  offset?: number;

  /**
   * Text inserted between a label and badge.
   *
   * @defaultValue `'  '`
   */
  badgeSeparator?: string;

  /** Maximum terminal-cell width of each row. */
  width: number;
}

const DEFAULT_CHARACTERS: NavigationListCharacters = {
  active: '●',
  disabled: '×',
  focused: '›',
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

function renderNavigationListRow({
  activeId,
  badgeSeparator,
  characters,
  focusedId,
  item,
  width,
}: {
  activeId: string | undefined;
  badgeSeparator: string;
  characters: NavigationListCharacters;
  focusedId: string | undefined;
  item: NavigationListItem;
  width: number;
}): string {
  const label = plainText(item.label);
  const badge = item.badge === undefined ? undefined : plainText(item.badge);

  assertOneLine(item.id, 'NavigationList item ids must be non-empty and fit on one line.');
  assertOneLine(label, 'NavigationList item labels must be non-empty and fit on one line.');

  if (badge !== undefined) {
    assertOneLine(badge, 'NavigationList item badges must be non-empty and fit on one line.');
  }

  const focus = item.id === focusedId ? characters.focused : ' ';
  const state =
    item.disabled === true
      ? characters.disabled
      : item.id === activeId
        ? characters.active
        : characters.idle;
  const prefix = `${focus} ${state} `;

  if (badge === undefined) {
    return truncateText(`${prefix}${label}`, width);
  }

  const base = `${prefix}${label}`;
  const suffix = `${plainText(badgeSeparator)}${badge}`;
  const gap = Math.max(0, width - visibleWidth(base) - visibleWidth(suffix));

  return truncateText(`${base}${' '.repeat(gap)}${suffix}`, width);
}

/**
 * Renders a bounded vertical navigation list.
 *
 * The renderer separates active route state from keyboard focus state and
 * exposes both with text markers for no-color terminals.
 *
 * @param options - Targets, state identifiers, viewport dimensions, and characters.
 * @returns Plain text containing at most `height` rows.
 */
export function renderNavigationList<TItem extends NavigationListItem>({
  activeId,
  badgeSeparator = '  ',
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No destinations',
  focusedId,
  height,
  items,
  offset = 0,
  width,
}: RenderNavigationListOptions<TItem>): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('NavigationList dimensions and offset must be non-negative integers.');
  }

  if (items.length === 0) {
    return truncateText(plainText(emptyText), width);
  }

  return items
    .slice(offset, offset + height)
    .map((item) =>
      renderNavigationListRow({
        activeId,
        badgeSeparator,
        characters,
        focusedId,
        item,
        width,
      }),
    )
    .join('\n');
}
