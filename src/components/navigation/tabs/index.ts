import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Minimum data required for one tab. */
export interface TabItem {
  /** Whether keyboard navigation and activation must skip this tab. */
  disabled?: boolean;

  /** Stable tab identifier. */
  id: string;

  /** Visible tab label. */
  label: string;
}

/** Character tokens used by {@link renderTabs}. */
export interface TabsCharacters {
  /** Marker shown before the focused tab. */
  focused: string;

  /** Marker shown before disabled tabs. */
  disabled: string;
}

/** Options accepted by {@link renderTabs}. */
export interface RenderTabsOptions<TItem extends TabItem = TabItem> {
  /** Identifier rendered as the selected tab. */
  activeId?: string;

  /** Character tokens for focus and disabled state. */
  characters?: TabsCharacters;

  /**
   * Text returned when `items` is empty.
   *
   * @defaultValue `'No tabs'`
   */
  emptyText?: string;

  /** Identifier rendered with a focus marker. */
  focusedId?: string;

  /** Ordered tabs. Caller-owned data is never mutated. */
  items: readonly TItem[];

  /**
   * Text inserted between tabs.
   *
   * @defaultValue `' '`
   */
  separator?: string;

  /** Maximum terminal-cell width of the rendered line. */
  width: number;
}

const DEFAULT_CHARACTERS: TabsCharacters = {
  disabled: '×',
  focused: '›',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

/**
 * Renders a one-line horizontal tab list.
 *
 * Active tabs are wrapped in brackets. Focus and disabled state are represented
 * by text markers so the output remains understandable without color.
 *
 * @param options - Tabs, state identifiers, separator, characters, and width.
 * @returns Plain terminal text without ANSI sequences or Blessed tags.
 */
export function renderTabs<TItem extends TabItem>({
  activeId,
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No tabs',
  focusedId,
  items,
  separator = ' ',
  width,
}: RenderTabsOptions<TItem>): string {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('Tabs width must be a non-negative integer.');
  }

  if (items.length === 0) {
    return truncateText(plainText(emptyText), width);
  }

  const renderedItems = items.map((item) => {
    const label = plainText(item.label);

    if (item.id.length === 0 || /[\r\n]/u.test(item.id)) {
      throw new RangeError('Tab ids must be non-empty and fit on one line.');
    }

    if (label.length === 0 || /[\r\n]/u.test(label)) {
      throw new RangeError('Tab labels must be non-empty and fit on one line.');
    }

    const focus = item.id === focusedId ? characters.focused : ' ';
    const state = item.disabled === true ? characters.disabled : ' ';
    const content = item.id === activeId ? `[${label}]` : ` ${label} `;

    return `${focus}${state}${content}`;
  });

  return truncateText(renderedItems.join(plainText(separator)), width);
}
