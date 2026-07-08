import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

export interface AutocompleteItem {
  disabled?: boolean;
  id: string;
  label: string;
}

export interface RenderAutocompleteOptions<TItem extends AutocompleteItem = AutocompleteItem> {
  activeId?: string;
  emptyText?: string;
  height: number;
  items: readonly TItem[];
  offset?: number;
  placeholder?: string;
  query?: string;
  width: number;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value)).trim();
}

/** Filters Autocomplete suggestions by prefix first, then substring. */
export function filterAutocompleteItems<TItem extends AutocompleteItem>(
  items: readonly TItem[],
  query = '',
): readonly TItem[] {
  const safeQuery = plainText(query).toLocaleLowerCase();

  if (safeQuery.length === 0) {
    return [...items];
  }

  const prefixMatches = items.filter((item) =>
    plainText(item.label).toLocaleLowerCase().startsWith(safeQuery),
  );

  return prefixMatches.length > 0
    ? prefixMatches
    : items.filter((item) => plainText(item.label).toLocaleLowerCase().includes(safeQuery));
}

/** Renders an input row plus bounded autocomplete suggestions. */
export function renderAutocomplete<TItem extends AutocompleteItem>({
  activeId,
  emptyText = 'No suggestions',
  height,
  items,
  offset = 0,
  placeholder = 'Type to search',
  query = '',
  width,
}: RenderAutocompleteOptions<TItem>): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('Autocomplete dimensions and offset must be non-negative integers.');
  }

  if (height === 0 || width === 0) {
    return '';
  }

  const safeQuery = plainText(query);
  const rows = [
    truncateText(`> ${safeQuery.length === 0 ? plainText(placeholder) : safeQuery}`, width),
  ];

  if (height === 1) {
    return rows.join('\n');
  }

  const matches = filterAutocompleteItems(items, safeQuery);

  if (matches.length === 0) {
    rows.push(truncateText(plainText(emptyText), width));

    return rows.join('\n');
  }

  for (const item of matches.slice(offset, offset + height - 1)) {
    const label = plainText(item.label);

    if (item.id.length === 0 || label.length === 0) {
      throw new RangeError('Autocomplete ids and labels must be non-empty.');
    }

    const marker = item.disabled === true ? '×' : item.id === activeId ? '›' : ' ';

    rows.push(truncateText(`${marker} ${label}`, width));
  }

  return rows.join('\n');
}
