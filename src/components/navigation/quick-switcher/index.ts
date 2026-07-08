import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

export interface QuickSwitcherItem {
  disabled?: boolean;
  group?: string;
  id: string;
  label: string;
  meta?: string;
}

export interface RenderQuickSwitcherOptions<TItem extends QuickSwitcherItem = QuickSwitcherItem> {
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

export function filterQuickSwitcherItems<TItem extends QuickSwitcherItem>(
  items: readonly TItem[],
  query = '',
): readonly TItem[] {
  const safeQuery = plainText(query).toLocaleLowerCase();

  if (safeQuery.length === 0) {
    return [...items];
  }

  return items.filter((item) =>
    [item.group, item.label, item.meta]
      .filter((value) => value !== undefined)
      .some((value) => plainText(value).toLocaleLowerCase().includes(safeQuery)),
  );
}

/** Renders a searchable resource/view switcher. */
export function renderQuickSwitcher<TItem extends QuickSwitcherItem>({
  activeId,
  emptyText = 'No matches',
  height,
  items,
  offset = 0,
  placeholder = 'Switch to',
  query = '',
  width,
}: RenderQuickSwitcherOptions<TItem>): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('QuickSwitcher dimensions and offset must be non-negative integers.');
  }

  if (height === 0 || width === 0) {
    return '';
  }

  const safeQuery = plainText(query);
  const rows = [
    truncateText(`> ${safeQuery.length === 0 ? plainText(placeholder) : safeQuery}`, width),
  ];
  const matches = filterQuickSwitcherItems(items, safeQuery);

  if (height === 1) {
    return rows.join('\n');
  }

  if (matches.length === 0) {
    rows.push(truncateText(plainText(emptyText), width));

    return rows.join('\n');
  }

  for (const item of matches.slice(offset, offset + height - 1)) {
    const label = plainText(item.label);

    if (item.id.length === 0 || label.length === 0) {
      throw new RangeError('QuickSwitcher ids and labels must be non-empty.');
    }

    const marker = item.disabled === true ? '×' : item.id === activeId ? '›' : ' ';
    const group = item.group === undefined ? '' : `${plainText(item.group)} / `;
    const meta = item.meta === undefined ? '' : ` - ${plainText(item.meta)}`;

    rows.push(truncateText(`${marker} ${group}${label}${meta}`, width));
  }

  return rows.join('\n');
}
