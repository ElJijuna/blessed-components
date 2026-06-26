import { visibleWidth } from '@/core/width.js';
import {
  type RenderTextOptions,
  renderText,
  type TextAlign,
  type TextOverflow,
} from '../text/index.js';

/** Supported semantic heading levels. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Options accepted by {@link renderHeading}. */
export interface RenderHeadingOptions
  extends Omit<RenderTextOptions, 'content' | 'height' | 'verticalAlign'> {
  /** Heading text. ANSI sequences and Blessed tags are removed. */
  content: string;

  /** Horizontal alignment applied after overflow handling. @defaultValue `'left'` */
  align?: TextAlign;

  /**
   * Semantic heading depth.
   *
   * @defaultValue `1`
   */
  level?: HeadingLevel;

  /**
   * Prefix the heading with Markdown-style level markers.
   *
   * @defaultValue `true`
   */
  marker?: boolean;

  /**
   * Horizontal overflow policy.
   *
   * @defaultValue `'truncate'`
   */
  overflow?: TextOverflow;

  /**
   * Add an underline sized to the rendered heading line.
   *
   * @defaultValue `false`
   */
  underline?: boolean;

  /**
   * Character used for the underline.
   *
   * @defaultValue `'-'`
   */
  underlineCharacter?: string;
}

function assertHeadingLevel(level: number): asserts level is HeadingLevel {
  if (!Number.isInteger(level) || level < 1 || level > 6) {
    throw new RangeError('Heading level must be an integer from 1 to 6.');
  }
}

/**
 * Renders a safe terminal heading with deterministic hierarchy markers.
 *
 * This function is framework-independent. Import it from
 * `blessed-components/heading` to keep Blessed outside the module graph.
 *
 * @param options - Content, level, marker, underline, and text layout options.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown when `level` is outside `1..6`, dimensions are invalid, or underline
 * character rendering produces no visible cells.
 */
export function renderHeading({
  content,
  level = 1,
  marker = true,
  overflow = 'truncate',
  underline = false,
  underlineCharacter = '-',
  ...textOptions
}: RenderHeadingOptions): string {
  assertHeadingLevel(level);

  const headingContent = marker ? `${'#'.repeat(level)} ${content}` : content;
  const headingLine = renderText({
    ...textOptions,
    content: headingContent,
    overflow,
  });

  if (!underline) {
    return headingLine;
  }

  const underlineCell = renderText({
    content: underlineCharacter,
    height: 1,
    overflow: 'clip',
    width: 1,
  });

  if (visibleWidth(underlineCell) === 0) {
    throw new RangeError('Heading underline character must occupy at least one terminal cell.');
  }

  const underlineWidth =
    textOptions.width === undefined
      ? Math.max(...headingLine.split('\n').map((line) => visibleWidth(line)))
      : textOptions.width;
  const underlineLine = underlineCell.repeat(underlineWidth);

  return `${headingLine}\n${underlineLine}`;
}
