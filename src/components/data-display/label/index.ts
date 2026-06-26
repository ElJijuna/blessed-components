import { type RenderTextOptions, renderText, type TextAlign } from '../text/index.js';

/** Single-line overflow policies supported by {@link renderLabel}. */
export type LabelOverflow = 'clip' | 'truncate';

/** Options accepted by {@link renderLabel}. */
export interface RenderLabelOptions
  extends Omit<RenderTextOptions, 'content' | 'height' | 'overflow' | 'verticalAlign'> {
  /** Label text. ANSI sequences and Blessed tags are removed. */
  content: string;

  /** Horizontal alignment applied after overflow handling. @defaultValue `'left'` */
  align?: TextAlign;

  /**
   * Spaces inserted between the label text and required indicator.
   *
   * @defaultValue `1`
   */
  indicatorGap?: number;

  /**
   * Single-line overflow policy.
   *
   * @defaultValue `'truncate'`
   */
  overflow?: LabelOverflow;

  /**
   * Whether to append a required indicator.
   *
   * @defaultValue `false`
   */
  required?: boolean;

  /**
   * Marker appended when `required` is true.
   *
   * @defaultValue `'*'`
   */
  requiredIndicator?: string;

  /**
   * Stable suffix after the label and optional required indicator.
   *
   * @defaultValue `':'`
   */
  suffix?: string;
}

/**
 * Renders a safe one-line label for controls or values.
 *
 * This function is framework-independent. Import it from
 * `blessed-components/label` to keep Blessed outside the module graph.
 *
 * @param options - Content, required indicator, suffix, and text layout options.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown when `indicatorGap` is invalid, `requiredIndicator` is empty while
 * required, or configured text dimensions are invalid.
 */
export function renderLabel({
  content,
  indicatorGap = 1,
  overflow = 'truncate',
  required = false,
  requiredIndicator = '*',
  suffix = ':',
  ...textOptions
}: RenderLabelOptions): string {
  if (!Number.isInteger(indicatorGap) || indicatorGap < 0) {
    throw new RangeError('Label indicator gap must be a non-negative integer.');
  }

  if (required && requiredIndicator.length === 0) {
    throw new RangeError('Label required indicator must be non-empty.');
  }

  const indicator = required ? `${' '.repeat(indicatorGap)}${requiredIndicator}` : '';

  return renderText({
    ...textOptions,
    content: `${content}${indicator}${suffix}`,
    height: 1,
    overflow,
  });
}
