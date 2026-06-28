import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Minimum data required for one Select option. */
export interface SelectItem {
  /** Whether navigation and selection must skip this option. */
  disabled?: boolean;

  /** Stable option identifier. */
  id: string;

  /** Human-readable option label. */
  label: string;
}

/** Character tokens used by {@link renderSelect}. */
export interface SelectCharacters {
  /** Marker shown beside the focused option. */
  active: string;

  /** Marker shown when the Select is closed. */
  closed: string;

  /** Marker rendered when disabled. */
  disabled: string;

  /** Marker shown when the Select is open. */
  open: string;

  /** Marker rendered when selected. */
  selected: string;

  /** Marker rendered when unselected. */
  unselected: string;
}

/** Options accepted by {@link renderSelect}. */
export interface RenderSelectOptions<TItem extends SelectItem = SelectItem> {
  /** Identifier receiving the visible focus marker when open. */
  activeId?: string;

  /** Character tokens used by the renderer. */
  characters?: SelectCharacters;

  /**
   * Text returned when `items` is empty.
   *
   * @defaultValue `'No options'`
   */
  emptyText?: string;

  /** Maximum number of rendered rows. */
  height: number;

  /** Ordered options. Caller-owned data is never mutated. */
  items: readonly TItem[];

  /** Whether the option list is visible. */
  open?: boolean;

  /**
   * First rendered option index when open.
   *
   * @defaultValue `0`
   */
  offset?: number;

  /**
   * Text shown when no value is selected.
   *
   * @defaultValue `'Select an option'`
   */
  placeholder?: string;

  /** Selected option identifier. */
  value?: string;

  /** Maximum terminal-cell width of each row. */
  width: number;
}

const DEFAULT_CHARACTERS: SelectCharacters = {
  active: '›',
  closed: '▸',
  disabled: '×',
  open: '▾',
  selected: '●',
  unselected: '○',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function assertOneLine(value: string, message: string): void {
  if (value.length === 0 || /[\r\n]/u.test(value)) {
    throw new RangeError(message);
  }
}

function renderOptionRow({
  activeId,
  characters,
  item,
  value,
  width,
}: {
  activeId: string | undefined;
  characters: SelectCharacters;
  item: SelectItem;
  value: string | undefined;
  width: number;
}): string {
  const label = plainText(item.label);

  assertOneLine(item.id, 'Select option ids must be non-empty and fit on one line.');
  assertOneLine(label, 'Select option labels must be non-empty and fit on one line.');

  const cursor = item.id === activeId ? characters.active : ' ';
  const state =
    item.disabled === true
      ? characters.disabled
      : item.id === value
        ? characters.selected
        : characters.unselected;

  return truncateText(`${cursor} ${state} ${label}`, width);
}

/**
 * Renders a compact single-selection Select.
 *
 * Closed Selects render one trigger row. Open Selects render the trigger plus
 * a bounded list of options with text markers for focus, selection, and
 * disabled state.
 */
export function renderSelect<TItem extends SelectItem>({
  activeId,
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No options',
  height,
  items,
  open = false,
  offset = 0,
  placeholder = 'Select an option',
  value,
  width,
}: RenderSelectOptions<TItem>): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('Select dimensions and offset must be non-negative integers.');
  }

  if (height === 0 || width === 0) {
    return '';
  }

  const selectedItem = items.find((item) => item.id === value);
  const selectedLabel =
    selectedItem === undefined ? plainText(placeholder) : plainText(selectedItem.label);

  assertOneLine(selectedLabel, 'Select selected label or placeholder must fit on one line.');

  const trigger = truncateText(
    `${open ? characters.open : characters.closed} ${selectedLabel}`,
    width,
  );

  if (!open || height === 1) {
    return trigger;
  }

  if (items.length === 0) {
    return [trigger, truncateText(plainText(emptyText), width)].slice(0, height).join('\n');
  }

  return [
    trigger,
    ...items.slice(offset, offset + height - 1).map((item) =>
      renderOptionRow({
        activeId,
        characters,
        item,
        value,
        width,
      }),
    ),
  ].join('\n');
}
