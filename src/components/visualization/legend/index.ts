import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** One series or category rendered by {@link renderLegend}. */
export interface LegendItem {
  /** Optional description appended after the label. */
  description?: string;

  /** Stable series or category identifier. */
  id: string;

  /** Visible label. */
  label: string;

  /**
   * Visible marker used to identify the item without color.
   *
   * @defaultValue `'■'`
   */
  marker?: string;
}

/** Supported legend arrangements. */
export type LegendLayout = 'horizontal' | 'vertical';

/** Options accepted by {@link renderLegend}. */
export interface RenderLegendOptions {
  /**
   * Text rendered when `items` is empty.
   *
   * @defaultValue `'No legend items'`
   */
  emptyText?: string;

  /**
   * Arrangement of legend entries.
   *
   * @defaultValue `'horizontal'`
   */
  layout?: LegendLayout;

  /** Ordered legend items. */
  items: readonly LegendItem[];

  /**
   * Separator between horizontally rendered entries.
   *
   * @defaultValue `'  '`
   */
  separator?: string;

  /** Optional maximum width of each rendered line. */
  width?: number;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function renderItem({ description, label, marker = '■' }: LegendItem): string {
  if (label.length === 0) {
    throw new RangeError('Legend item labels must be non-empty.');
  }

  if (marker.length === 0) {
    throw new RangeError('Legend item markers must be non-empty.');
  }

  const normalizedLabel = plainText(label);
  const normalizedMarker = plainText(marker);
  const normalizedDescription =
    description === undefined || description.length === 0 ? '' : ` ${plainText(description)}`;

  return `${normalizedMarker} ${normalizedLabel}${normalizedDescription}`;
}

function fitLine(line: string, width?: number): string {
  if (width === undefined) {
    return line;
  }

  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('Legend width must be a non-negative integer.');
  }

  return truncateText(line, width);
}

/**
 * Renders a deterministic legend for chart series or categorical values.
 *
 * Markers are included in the text output so the legend remains meaningful in
 * no-color terminals. Dynamic labels, markers, descriptions, and separators are
 * stripped of ANSI sequences and Blessed tags.
 *
 * @param options - Items, arrangement, separator, and optional width.
 * @returns Plain terminal text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown when width is invalid, labels are empty, or markers are empty.
 */
export function renderLegend({
  emptyText = 'No legend items',
  items,
  layout = 'horizontal',
  separator = '  ',
  width,
}: RenderLegendOptions): string {
  if (items.length === 0) {
    return fitLine(plainText(emptyText), width);
  }

  const renderedItems = items.map(renderItem);

  if (layout === 'vertical') {
    return renderedItems.map((line) => fitLine(line, width)).join('\n');
  }

  return fitLine(renderedItems.join(plainText(separator)), width);
}
