import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Minimum data required for one MultiSelect option. */
export interface MultiSelectItem {
  /** Whether navigation and selection must skip this option. */
  disabled?: boolean;

  /** Stable option identifier. */
  id: string;

  /** Human-readable option label. */
  label: string;
}

/** Character tokens used by {@link renderMultiSelect}. */
export interface MultiSelectCharacters {
  /** Marker shown beside the focused option. */
  active: string;

  /** Marker shown when the MultiSelect is closed. */
  closed: string;

  /** Marker rendered when disabled. */
  disabled: string;

  /** Marker shown when the MultiSelect is open. */
  open: string;

  /** Marker rendered when selected. */
  selected: string;

  /** Marker rendered when unselected. */
  unselected: string;
}

/** Options accepted by {@link renderMultiSelect}. */
export interface RenderMultiSelectOptions<TItem extends MultiSelectItem = MultiSelectItem> {
  /** Identifier receiving the visible focus marker when open. */
  activeId?: string;

  /** Character tokens used by the renderer. */
  characters?: MultiSelectCharacters;

  /** Text returned when `items` is empty. @defaultValue `'No options'` */
  emptyText?: string;

  /** Maximum number of rendered rows. */
  height: number;

  /** Ordered options. Caller-owned data is never mutated. */
  items: readonly TItem[];

  /** Whether the option list is visible. */
  open?: boolean;

  /** First rendered option index when open. @defaultValue `0` */
  offset?: number;

  /** Text shown when no values are selected. @defaultValue `'Select options'` */
  placeholder?: string;

  /** Selected option identifiers. */
  values?: readonly string[];

  /** Maximum terminal-cell width of each row. */
  width: number;
}

const DEFAULT_CHARACTERS: MultiSelectCharacters = {
  active: '›',
  closed: '▸',
  disabled: '×',
  open: '▾',
  selected: 'x',
  unselected: ' ',
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
  selected,
  width,
}: {
  activeId: string | undefined;
  characters: MultiSelectCharacters;
  item: MultiSelectItem;
  selected: ReadonlySet<string>;
  width: number;
}): string {
  const label = plainText(item.label);

  assertOneLine(item.id, 'MultiSelect option ids must be non-empty and fit on one line.');
  assertOneLine(label, 'MultiSelect option labels must be non-empty and fit on one line.');

  const cursor = item.id === activeId ? characters.active : ' ';
  const state =
    item.disabled === true
      ? characters.disabled
      : selected.has(item.id)
        ? characters.selected
        : characters.unselected;

  return truncateText(`${cursor} [${state}] ${label}`, width);
}

function summaryLabel<TItem extends MultiSelectItem>({
  items,
  placeholder,
  selected,
}: {
  items: readonly TItem[];
  placeholder: string;
  selected: ReadonlySet<string>;
}): string {
  const selectedItems = items.filter((item) => selected.has(item.id));

  if (selectedItems.length === 0) {
    return plainText(placeholder);
  }

  if (selectedItems.length <= 2) {
    return selectedItems.map((item) => plainText(item.label)).join(', ');
  }

  return `${selectedItems.length} selected`;
}

/** Renders a compact multi-selection control with a bounded option list. */
export function renderMultiSelect<TItem extends MultiSelectItem>({
  activeId,
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No options',
  height,
  items,
  open = false,
  offset = 0,
  placeholder = 'Select options',
  values = [],
  width,
}: RenderMultiSelectOptions<TItem>): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('MultiSelect dimensions and offset must be non-negative integers.');
  }

  if (height === 0 || width === 0) {
    return '';
  }

  const selected = new Set(values);
  const label = summaryLabel({ items, placeholder, selected });

  assertOneLine(label, 'MultiSelect summary or placeholder must fit on one line.');

  const trigger = truncateText(`${open ? characters.open : characters.closed} ${label}`, width);

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
        selected,
        width,
      }),
    ),
  ].join('\n');
}
