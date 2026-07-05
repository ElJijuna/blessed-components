import { stripBlessedTags } from '@/core/tags.js';
import { truncateText, wrapText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** One term and description pair rendered by {@link renderDescriptionList}. */
export interface DescriptionListItem {
  /** Non-empty term identifying the description. Must fit on one line. */
  term: string;

  /** Description text. Numeric descriptions must be finite. */
  description: number | string;
}

/** Available arrangements for {@link renderDescriptionList}. */
export type DescriptionListLayout = 'auto' | 'columns' | 'stacked';

/** Options accepted by {@link renderDescriptionList}. */
export interface RenderDescriptionListOptions {
  /**
   * Spaces between the term column and description in the columns layout.
   *
   * @defaultValue `2`
   */
  gap?: number;

  /** Ordered term and description entries. */
  items: readonly DescriptionListItem[];

  /**
   * Entry arrangement.
   *
   * `auto` uses columns when the available width can fit useful description
   * text, and stacked rows otherwise.
   *
   * @defaultValue `'auto'`
   */
  layout?: DescriptionListLayout;

  /**
   * Blank lines inserted between entries.
   *
   * @defaultValue `0`
   */
  rowGap?: number;

  /**
   * Width reserved for every term in terminal cells.
   *
   * `auto` uses the widest term. A numeric width truncates longer terms.
   *
   * @defaultValue `'auto'`
   */
  termWidth?: 'auto' | number;

  /** Available content width in terminal cells. Enables responsive wrapping. */
  width?: number;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function padEnd(value: string, width: number): string {
  return `${value}${' '.repeat(Math.max(0, width - visibleWidth(value)))}`;
}

function validateWholeNumber(value: number | undefined, name: string): void {
  if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
    throw new RangeError(`DescriptionList ${name} must be a non-negative integer.`);
  }
}

function renderWrapped(value: string, width: number | undefined): string[] {
  return width === undefined ? value.split('\n') : wrapText(value, Math.max(1, width));
}

/**
 * Renders term/description groups as plain terminal text.
 *
 * This function is framework-independent. Import it from
 * `blessed-components/description-list` to keep Blessed outside the module
 * graph.
 *
 * @param options - Entries, layout, spacing, and optional responsive width.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown for empty or multiline terms, non-finite numeric descriptions,
 * invalid widths, or invalid spacing.
 */
export function renderDescriptionList({
  gap = 2,
  items,
  layout = 'auto',
  rowGap = 0,
  termWidth = 'auto',
  width,
}: RenderDescriptionListOptions): string {
  validateWholeNumber(gap, 'gap');
  validateWholeNumber(rowGap, 'row gap');

  if (termWidth !== 'auto' && (!Number.isInteger(termWidth) || termWidth < 1)) {
    throw new RangeError('DescriptionList term width must be a positive integer or auto.');
  }

  if (width !== undefined && (!Number.isInteger(width) || width < 1)) {
    throw new RangeError('DescriptionList width must be a positive integer.');
  }

  if (!['auto', 'columns', 'stacked'].includes(layout)) {
    throw new RangeError('DescriptionList layout must be auto, columns, or stacked.');
  }

  const normalizedItems = items.map(({ description, term }) => {
    const normalizedTerm = plainText(term);

    if (normalizedTerm.length === 0 || /[\r\n]/u.test(normalizedTerm)) {
      throw new RangeError('DescriptionList terms must be non-empty and fit on one line.');
    }

    if (typeof description === 'number' && !Number.isFinite(description)) {
      throw new RangeError('DescriptionList numeric descriptions must be finite.');
    }

    return {
      description: plainText(String(description)),
      term: normalizedTerm,
    };
  });
  const resolvedTermWidth =
    termWidth === 'auto'
      ? normalizedItems.reduce((widest, item) => Math.max(widest, visibleWidth(item.term)), 0)
      : termWidth;
  const columnsPrefixWidth = resolvedTermWidth + gap;
  const descriptionWidth = width === undefined ? undefined : width - columnsPrefixWidth;
  const resolvedLayout =
    layout === 'auto' && (descriptionWidth === undefined || descriptionWidth >= 8)
      ? 'columns'
      : layout === 'auto'
        ? 'stacked'
        : layout;
  const separator = `\n${'\n'.repeat(rowGap)}`;

  if (resolvedLayout === 'stacked') {
    return normalizedItems
      .map((item) => {
        const descriptionLines = renderWrapped(item.description, width);

        return [item.term, ...descriptionLines.map((line) => `${' '.repeat(gap)}${line}`)].join(
          '\n',
        );
      })
      .join(separator);
  }

  return normalizedItems
    .map((item) => {
      const fittedTerm =
        visibleWidth(item.term) > resolvedTermWidth
          ? truncateText(item.term, resolvedTermWidth)
          : item.term;
      const prefix = `${padEnd(fittedTerm, resolvedTermWidth)}${' '.repeat(gap)}`;
      const descriptionLines = renderWrapped(item.description, descriptionWidth);
      const [firstLine = '', ...continuationLines] = descriptionLines;
      const continuationIndent = ' '.repeat(visibleWidth(prefix));

      return [
        `${prefix}${firstLine}`,
        ...continuationLines.map((line) => `${continuationIndent}${line}`),
      ].join('\n');
    })
    .join(separator);
}
