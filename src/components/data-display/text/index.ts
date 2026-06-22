import { stripBlessedTags } from '@/core/tags.js';
import { truncateText, wrapText } from '@/core/truncate.js';
import { sliceByWidth, stripAnsi, visibleWidth } from '@/core/width.js';

/**
 * Horizontal text alignment within a configured width.
 */
export type TextAlign = 'center' | 'left' | 'right';

/**
 * Vertical text alignment within a configured height.
 */
export type TextVerticalAlign = 'bottom' | 'middle' | 'top';

/**
 * Policy applied when a text line exceeds the configured width.
 */
export type TextOverflow = 'clip' | 'truncate' | 'wrap';

/**
 * Options accepted by {@link renderText}.
 */
export interface RenderTextOptions {
  /**
   * Horizontal alignment applied after overflow handling.
   *
   * @defaultValue `'left'`
   */
  align?: TextAlign;

  /** Dynamic terminal text. ANSI sequences and Blessed tags are removed. */
  content: string;

  /** Maximum rendered line count. */
  height?: number;

  /**
   * Omission marker used by `truncate` overflow.
   *
   * @defaultValue `'…'`
   */
  omission?: string;

  /**
   * Horizontal overflow policy.
   *
   * @defaultValue `'wrap'`
   */
  overflow?: TextOverflow;

  /**
   * Truncation position used by `truncate` overflow.
   *
   * @defaultValue `'end'`
   */
  truncatePosition?: 'end' | 'middle' | 'start';

  /**
   * Vertical alignment applied when both `height` and `width` are configured.
   *
   * @defaultValue `'top'`
   */
  verticalAlign?: TextVerticalAlign;

  /** Maximum rendered width measured in terminal cells. */
  width?: number;
}

function sanitizeText(value: string): string {
  return stripBlessedTags(stripAnsi(value));
}

function alignLine(value: string, width: number, align: TextAlign): string {
  const padding = Math.max(0, width - visibleWidth(value));

  if (align === 'right') {
    return `${' '.repeat(padding)}${value}`;
  }

  if (align === 'center') {
    const left = Math.floor(padding / 2);

    return `${' '.repeat(left)}${value}`;
  }

  return value;
}

/**
 * Renders safe text within optional terminal-cell dimensions.
 *
 * The renderer removes ANSI control sequences and Blessed formatting tags so
 * caller content cannot inject terminal styling. Width calculations use
 * grapheme-aware terminal cells, including wide Unicode and emoji.
 *
 * @param options - Content, dimensions, overflow, and alignment.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown when configured dimensions are not non-negative integers, or when
 * wrapping is requested with a zero width.
 */
export function renderText({
  align = 'left',
  content,
  height,
  omission = '…',
  overflow = 'wrap',
  truncatePosition = 'end',
  verticalAlign = 'top',
  width,
}: RenderTextOptions): string {
  if (
    (width !== undefined && (!Number.isInteger(width) || width < 0)) ||
    (height !== undefined && (!Number.isInteger(height) || height < 0))
  ) {
    throw new RangeError('Text dimensions must be non-negative integers.');
  }

  const safeContent = sanitizeText(content);

  let lines = safeContent.split('\n');

  if (width !== undefined) {
    if (overflow === 'wrap') {
      if (width === 0) {
        throw new RangeError('Text wrap width must be a positive integer.');
      }

      lines = wrapText(safeContent, width);
    } else if (overflow === 'truncate') {
      lines = lines.map((line) =>
        truncateText(line, width, {
          omission,
          position: truncatePosition,
        }),
      );
    } else {
      lines = lines.map((line) => sliceByWidth(line, width));
    }
  }

  if (height !== undefined) {
    lines = lines.slice(0, height);
  }

  if (width !== undefined) {
    lines = lines.map((line) => alignLine(line, width, align));
  }

  if (height !== undefined && lines.length < height) {
    const blank = '';
    const missing = height - lines.length;
    const before =
      verticalAlign === 'bottom'
        ? missing
        : verticalAlign === 'middle'
          ? Math.floor(missing / 2)
          : 0;
    const after = missing - before;

    lines = [
      ...Array.from({ length: before }, () => blank),
      ...lines,
      ...Array.from({ length: after }, () => blank),
    ];
  }

  return lines.join('\n');
}
