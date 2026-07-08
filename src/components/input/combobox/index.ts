import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Minimum data required for one Combobox option. */
export interface ComboboxItem {
  disabled?: boolean;
  id: string;
  label: string;
}

/** Character tokens used by {@link renderCombobox}. */
export interface ComboboxCharacters {
  active: string;
  closed: string;
  disabled: string;
  open: string;
  selected: string;
  unselected: string;
}

/** Options accepted by {@link renderCombobox}. */
export interface RenderComboboxOptions<TItem extends ComboboxItem = ComboboxItem> {
  activeId?: string;
  characters?: ComboboxCharacters;
  emptyText?: string;
  height: number;
  items: readonly TItem[];
  offset?: number;
  open?: boolean;
  placeholder?: string;
  query?: string;
  value?: string;
  width: number;
}

const DEFAULT_CHARACTERS: ComboboxCharacters = {
  active: '›',
  closed: '▸',
  disabled: '×',
  open: '▾',
  selected: '●',
  unselected: '○',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value)).trim();
}

/** Filters Combobox options by label using case-insensitive text. */
export function filterComboboxItems<TItem extends ComboboxItem>(
  items: readonly TItem[],
  query = '',
): readonly TItem[] {
  const safeQuery = plainText(query).toLocaleLowerCase();

  if (safeQuery.length === 0) {
    return [...items];
  }

  return items.filter((item) => plainText(item.label).toLocaleLowerCase().includes(safeQuery));
}

/** Renders query input plus optional bounded suggestions. */
export function renderCombobox<TItem extends ComboboxItem>({
  activeId,
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No matches',
  height,
  items,
  offset = 0,
  open = false,
  placeholder = 'Search',
  query = '',
  value,
  width,
}: RenderComboboxOptions<TItem>): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('Combobox dimensions and offset must be non-negative integers.');
  }

  if (height === 0 || width === 0) {
    return '';
  }

  const safeQuery = plainText(query);
  const selected = items.find((item) => item.id === value);
  const inputText = safeQuery.length > 0 ? safeQuery : (selected?.label ?? placeholder);
  const rows = [
    truncateText(`${open ? characters.open : characters.closed} ${plainText(inputText)}`, width),
  ];

  if (!open || height === 1) {
    return rows.join('\n');
  }

  const matches = filterComboboxItems(items, safeQuery);

  if (matches.length === 0) {
    rows.push(truncateText(plainText(emptyText), width));

    return rows.slice(0, height).join('\n');
  }

  for (const item of matches.slice(offset, offset + height - 1)) {
    const label = plainText(item.label);

    if (item.id.length === 0 || label.length === 0) {
      throw new RangeError('Combobox ids and labels must be non-empty.');
    }

    const cursor = item.id === activeId ? characters.active : ' ';
    const state =
      item.disabled === true
        ? characters.disabled
        : item.id === value
          ? characters.selected
          : characters.unselected;

    rows.push(truncateText(`${cursor} ${state} ${label}`, width));
  }

  return rows.join('\n');
}
