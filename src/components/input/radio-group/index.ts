import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Minimum data required for one radio option. */
export interface RadioGroupItem {
  /** Whether navigation and selection must skip this option. */
  disabled?: boolean;

  /** Stable option identifier. */
  id: string;

  /** Human-readable option label. */
  label: string;
}

/** Character tokens used by {@link renderRadioGroup}. */
export interface RadioGroupCharacters {
  /** Marker shown beside the focused option. */
  active: string;

  /** Marker rendered when disabled. */
  disabled: string;

  /** Marker rendered when selected. */
  selected: string;

  /** Marker rendered when unselected. */
  unselected: string;
}

/** Options accepted by {@link renderRadioGroup}. */
export interface RenderRadioGroupOptions<TItem extends RadioGroupItem = RadioGroupItem> {
  /** Identifier receiving the visible focus marker. */
  activeId?: string;

  /** Character tokens used by the renderer. */
  characters?: RadioGroupCharacters;

  /**
   * Text returned when `items` is empty.
   *
   * @defaultValue `'No options'`
   */
  emptyText?: string;

  /** Maximum number of rendered rows. */
  height: number;

  /** Ordered radio options. Caller-owned data is never mutated. */
  items: readonly TItem[];

  /**
   * First rendered option index.
   *
   * @defaultValue `0`
   */
  offset?: number;

  /** Selected option identifier. */
  value?: string;

  /** Maximum terminal-cell width of each row. */
  width: number;
}

const DEFAULT_CHARACTERS: RadioGroupCharacters = {
  active: '›',
  disabled: '×',
  selected: '●',
  unselected: '○',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

/**
 * Renders a bounded vertical radio group.
 *
 * Selected, focused, and disabled states use text markers so the output remains
 * understandable without terminal color.
 */
export function renderRadioGroup<TItem extends RadioGroupItem>({
  activeId,
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No options',
  height,
  items,
  offset = 0,
  value,
  width,
}: RenderRadioGroupOptions<TItem>): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('RadioGroup dimensions and offset must be non-negative integers.');
  }

  if (items.length === 0) {
    return truncateText(plainText(emptyText), width);
  }

  return items
    .slice(offset, offset + height)
    .map((item) => {
      const label = plainText(item.label);

      if (item.id.length === 0 || /[\r\n]/u.test(item.id)) {
        throw new RangeError('RadioGroup option ids must be non-empty and fit on one line.');
      }

      if (label.length === 0 || /[\r\n]/u.test(label)) {
        throw new RangeError('RadioGroup option labels must be non-empty and fit on one line.');
      }

      const cursor = item.id === activeId ? characters.active : ' ';
      const state =
        item.disabled === true
          ? characters.disabled
          : item.id === value
            ? characters.selected
            : characters.unselected;

      return truncateText(`${cursor} ${state} ${label}`, width);
    })
    .join('\n');
}
