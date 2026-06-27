import type { KeymapHelpItem } from '@/core/keymap.js';
import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** One named group of help shortcuts. */
export interface HelpOverlaySection<TItem extends KeymapHelpItem = KeymapHelpItem> {
  /** Shortcut entries rendered under the section title. */
  items: readonly TItem[];

  /** Visible section title. */
  title: string;
}

/** Character tokens used by {@link renderHelpOverlay}. */
export interface HelpOverlayCharacters {
  /** Prefix used for empty and no-result states. */
  empty: string;

  /** Prefix used before section titles. */
  section: string;
}

/** Options accepted by {@link renderHelpOverlay}. */
export interface RenderHelpOverlayOptions<TItem extends KeymapHelpItem = KeymapHelpItem> {
  /** Character tokens used by the renderer. */
  characters?: HelpOverlayCharacters;

  /**
   * Text returned when no shortcuts are provided.
   *
   * @defaultValue `'No shortcuts'`
   */
  emptyText?: string;

  /** Maximum rendered height. */
  height: number;

  /**
   * Text returned when filtering has no matches.
   *
   * @defaultValue `'No matching shortcuts'`
   */
  noResultsText?: string;

  /**
   * Search query matched against ids, descriptions, and key chords.
   *
   * @defaultValue `''`
   */
  query?: string;

  /** Ordered shortcut sections. */
  sections: readonly HelpOverlaySection<TItem>[];

  /**
   * Visible title.
   *
   * @defaultValue `'Keyboard shortcuts'`
   */
  title?: string;

  /** Maximum terminal-cell width of each line. */
  width: number;
}

const DEFAULT_CHARACTERS: HelpOverlayCharacters = {
  empty: '-',
  section: '#',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function assertOneLine(value: string, message: string): string {
  const plain = plainText(value);

  if (plain.length === 0 || /[\r\n]/u.test(plain)) {
    throw new RangeError(message);
  }

  return plain;
}

function matchesQuery(item: KeymapHelpItem, query: string): boolean {
  if (query.length === 0) {
    return true;
  }

  const haystack = [item.id, item.description, ...item.keys].join(' ').toLowerCase();

  return haystack.includes(query);
}

function renderShortcutRow({
  description,
  keys,
  width,
}: {
  description: string;
  keys: string;
  width: number;
}): string {
  const keyColumn = truncateText(keys, Math.min(18, Math.max(0, width)));
  const separator = '  ';
  const descriptionWidth = Math.max(0, width - visibleWidth(keyColumn) - separator.length);

  return truncateText(
    `${keyColumn}${separator}${truncateText(description, descriptionWidth)}`,
    width,
  );
}

/**
 * Renders a searchable keyboard shortcut reference.
 *
 * Sections remain in caller order. Filtering is case-insensitive and preserves
 * section headings only when at least one row in that section matches.
 */
export function renderHelpOverlay<TItem extends KeymapHelpItem = KeymapHelpItem>({
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No shortcuts',
  height,
  noResultsText = 'No matching shortcuts',
  query = '',
  sections,
  title = 'Keyboard shortcuts',
  width,
}: RenderHelpOverlayOptions<TItem>): string {
  if (!Number.isInteger(height) || height < 0 || !Number.isInteger(width) || width < 0) {
    throw new RangeError('HelpOverlay dimensions must be non-negative integers.');
  }

  const normalizedQuery = plainText(query).trim().toLowerCase();
  const lines: string[] = [];
  const hasItems = sections.some(({ items }) => items.length > 0);

  lines.push(truncateText(assertOneLine(title, 'HelpOverlay title must fit on one line.'), width));

  if (normalizedQuery.length > 0) {
    lines.push(truncateText(`Search: ${normalizedQuery}`, width));
  }

  if (!hasItems) {
    lines.push(
      truncateText(
        `${characters.empty} ${assertOneLine(emptyText, 'HelpOverlay empty text must fit on one line.')}`,
        width,
      ),
    );

    return lines.slice(0, height).join('\n');
  }

  for (const section of sections) {
    const titleText = assertOneLine(
      section.title,
      'HelpOverlay section titles must fit on one line.',
    );
    const matchingItems = section.items.filter((item) => matchesQuery(item, normalizedQuery));

    if (matchingItems.length === 0) {
      continue;
    }

    lines.push(truncateText(`${characters.section} ${titleText}`, width));

    for (const item of matchingItems) {
      const description = assertOneLine(
        item.description,
        'HelpOverlay item descriptions must fit on one line.',
      );
      const id = assertOneLine(item.id, 'HelpOverlay item ids must fit on one line.');
      const keys = item.keys.map((key) =>
        assertOneLine(key, 'HelpOverlay keys must fit on one line.'),
      );

      if (keys.length === 0) {
        throw new RangeError(`HelpOverlay item "${id}" must include at least one key.`);
      }

      lines.push(renderShortcutRow({ description, keys: keys.join(', '), width }));
    }
  }

  if (lines.length === (normalizedQuery.length > 0 ? 2 : 1)) {
    lines.push(
      truncateText(
        `${characters.empty} ${assertOneLine(
          noResultsText,
          'HelpOverlay no-results text must fit on one line.',
        )}`,
        width,
      ),
    );
  }

  return lines.slice(0, height).join('\n');
}
