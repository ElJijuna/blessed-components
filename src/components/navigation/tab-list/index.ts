import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Minimum data required for one tab trigger. */
export interface TabListItem {
  /** Whether keyboard navigation and activation must skip this trigger. */
  disabled?: boolean;

  /** Stable trigger identifier. */
  id: string;

  /** Visible trigger label. */
  label: string;
}

/** Character tokens used by {@link renderTabList}. */
export interface TabListCharacters {
  /** Marker shown before the focused trigger. */
  focused: string;

  /** Marker shown before disabled triggers. */
  disabled: string;
}

/** Options accepted by {@link renderTabList}. */
export interface RenderTabListOptions<TItem extends TabListItem = TabListItem> {
  /** Identifier rendered as the selected trigger. */
  activeId?: string;

  /** Character tokens for focus and disabled state. */
  characters?: TabListCharacters;

  /**
   * Text returned when `items` is empty.
   *
   * @defaultValue `'No tab triggers'`
   */
  emptyText?: string;

  /** Identifier rendered with a focus marker. */
  focusedId?: string;

  /** Ordered tab triggers. Caller-owned data is never mutated. */
  items: readonly TItem[];

  /**
   * Text inserted between triggers.
   *
   * @defaultValue `' '`
   */
  separator?: string;

  /** Maximum terminal-cell width of the rendered line. */
  width: number;
}

const DEFAULT_CHARACTERS: TabListCharacters = {
  disabled: '×',
  focused: '›',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

/**
 * Renders a horizontal collection of tab triggers.
 *
 * `TabList` models only the trigger collection. It does not own panels or view
 * content, which lets callers compose it into larger tab systems.
 *
 * @param options - Trigger items, state identifiers, separator, characters, and width.
 * @returns Plain terminal text without ANSI sequences or Blessed tags.
 */
export function renderTabList<TItem extends TabListItem>({
  activeId,
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No tab triggers',
  focusedId,
  items,
  separator = ' ',
  width,
}: RenderTabListOptions<TItem>): string {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('TabList width must be a non-negative integer.');
  }

  if (items.length === 0) {
    return truncateText(plainText(emptyText), width);
  }

  const renderedItems = items.map((item) => {
    const label = plainText(item.label);

    if (item.id.length === 0 || /[\r\n]/u.test(item.id)) {
      throw new RangeError('TabList item ids must be non-empty and fit on one line.');
    }

    if (label.length === 0 || /[\r\n]/u.test(label)) {
      throw new RangeError('TabList item labels must be non-empty and fit on one line.');
    }

    const focus = item.id === focusedId ? characters.focused : ' ';
    const state = item.disabled === true ? characters.disabled : ' ';
    const content = item.id === activeId ? `<${label}>` : ` ${label} `;

    return `${focus}${state}${content}`;
  });

  return truncateText(renderedItems.join(plainText(separator)), width);
}
