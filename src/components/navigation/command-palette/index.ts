import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Minimum data required for one command. */
export interface CommandPaletteItem {
  /** Secondary searchable command text. */
  description?: string;

  /** Whether command cannot be executed. */
  disabled?: boolean;

  /** Stable command identifier. */
  id: string;

  /** Primary command label. */
  label: string;
}

/** Character tokens used by {@link renderCommandPalette}. */
export interface CommandPaletteCharacters {
  active: string;
  disabled: string;
  idle: string;
}

/** Options accepted by {@link renderCommandPalette}. */
export interface RenderCommandPaletteOptions<
  TItem extends CommandPaletteItem = CommandPaletteItem,
> {
  activeId?: string;
  characters?: CommandPaletteCharacters;
  emptyText?: string;
  height: number;
  items: readonly TItem[];
  offset?: number;
  placeholder?: string;
  query?: string;
  width: number;
}

const DEFAULT_CHARACTERS: CommandPaletteCharacters = {
  active: '›',
  disabled: '×',
  idle: ' ',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value)).trim();
}

/** Filters commands by label or description using case-insensitive text. */
export function filterCommandPaletteItems<TItem extends CommandPaletteItem>(
  items: readonly TItem[],
  query = '',
): readonly TItem[] {
  const safeQuery = plainText(query).toLocaleLowerCase();

  if (safeQuery.length === 0) {
    return [...items];
  }

  return items.filter((item) => {
    const label = plainText(item.label).toLocaleLowerCase();
    const description =
      item.description === undefined ? '' : plainText(item.description).toLocaleLowerCase();

    return label.includes(safeQuery) || description.includes(safeQuery);
  });
}

/** Renders a searchable command list with one query row. */
export function renderCommandPalette<TItem extends CommandPaletteItem>({
  activeId,
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No commands',
  height,
  items,
  offset = 0,
  placeholder = 'Type a command',
  query = '',
  width,
}: RenderCommandPaletteOptions<TItem>): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(offset) ||
    offset < 0
  ) {
    throw new RangeError('CommandPalette dimensions and offset must be non-negative integers.');
  }

  if (height === 0 || width === 0) {
    return '';
  }

  const safeQuery = plainText(query);
  const rows = [
    truncateText(`> ${safeQuery.length === 0 ? plainText(placeholder) : safeQuery}`, width),
  ];
  const visibleItems = filterCommandPaletteItems(items, safeQuery);

  if (height === 1) {
    return rows.join('\n');
  }

  if (visibleItems.length === 0) {
    rows.push(truncateText(plainText(emptyText), width));

    return rows.slice(0, height).join('\n');
  }

  for (const item of visibleItems.slice(offset, offset + height - 1)) {
    const label = plainText(item.label);

    if (item.id.length === 0 || label.length === 0) {
      throw new RangeError('CommandPalette ids and labels must be non-empty.');
    }

    const marker =
      item.disabled === true
        ? characters.disabled
        : item.id === activeId
          ? characters.active
          : characters.idle;
    const description =
      item.description === undefined || plainText(item.description).length === 0
        ? ''
        : ` - ${plainText(item.description)}`;

    rows.push(truncateText(`${marker} ${label}${description}`, width));
  }

  return rows.join('\n');
}
