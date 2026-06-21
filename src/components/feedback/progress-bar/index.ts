/**
 * Options accepted by {@link renderProgressBar}.
 *
 * The renderer maps `value` from the inclusive numeric range defined by
 * `min` and `max` into a fixed-width terminal track. Values outside the range
 * are clamped before rendering.
 *
 * @example Basic percentage bar
 *
 * ```ts
 * renderProgressBar({
 *   value: 50,
 *   width: 10,
 * });
 * // "█████░░░░░ 50%"
 * ```
 *
 * @example Custom range and label
 *
 * ```ts
 * renderProgressBar({
 *   label: 'Workers',
 *   min: 0,
 *   max: 8,
 *   value: 6,
 *   width: 8,
 * });
 * // "Workers ██████░░ 75%"
 * ```
 */
export interface RenderProgressBarOptions {
  /**
   * Characters used to render filled and empty cells.
   *
   * Each character should occupy one terminal cell. Multi-cell or combining
   * characters can make the visible track wider than `width`.
   *
   * @defaultValue `{ filled: '█', empty: '░' }`
   */
  characters?: ProgressBarCharacters;

  /**
   * Formats the value text appended after the track.
   *
   * The callback receives the clamped numeric value and its rounded
   * percentage. Returning an empty string leaves the trailing separator in
   * place; callers that need a track-only representation should account for
   * that when composing output.
   *
   * @defaultValue `({ percentage }) => `${percentage}%``
   */
  formatValue?: (context: ProgressBarValueContext) => string;

  /**
   * Optional text rendered before the track.
   *
   * Dynamic values must be escaped by the caller if the returned string will
   * later be inserted into a Blessed element with tags enabled. The bundled
   * Blessed adapter disables tags.
   */
  label?: string;

  /**
   * Upper bound of the numeric range.
   *
   * Must be finite and greater than `min`.
   *
   * @defaultValue `100`
   */
  max?: number;

  /**
   * Lower bound of the numeric range.
   *
   * Must be finite and lower than `max`.
   *
   * @defaultValue `0`
   */
  min?: number;

  /**
   * Current numeric value.
   *
   * The value must be finite. Values below `min` or above `max` are clamped
   * before the percentage and formatted value are calculated.
   */
  value: number;

  /**
   * Number of characters reserved for the progress track.
   *
   * This excludes the optional label, spaces, and formatted value. It must be
   * a positive integer.
   */
  width: number;
}

/**
 * Character pair used to draw a progress track.
 *
 * Use ASCII characters when the target terminal cannot display Unicode block
 * glyphs reliably.
 *
 * @example
 *
 * ```ts
 * const asciiCharacters: ProgressBarCharacters = {
 *   filled: '#',
 *   empty: '-',
 * };
 * ```
 */
export interface ProgressBarCharacters {
  /** Character repeated for unfilled track cells. */
  empty: string;

  /** Character repeated for filled track cells. */
  filled: string;
}

/**
 * Normalized value information passed to a progress value formatter.
 */
export interface ProgressBarValueContext {
  /**
   * Rounded progress in the inclusive range from `0` to `100`.
   */
  percentage: number;

  /**
   * Numeric value after it has been clamped to the configured range.
   */
  value: number;
}

/**
 * Renders a deterministic, single-line progress bar.
 *
 * This function is framework-independent and does not import Blessed. Import
 * it from `blessed-components/progress-bar` when only string rendering is
 * needed; that subpath keeps the Blessed adapter out of the module graph.
 *
 * The result has this structure:
 *
 * ```text
 * [label + space][fixed-width track][space][formatted value]
 * ```
 *
 * @param options - Numeric range, track width, characters, and text formatting.
 * @returns A plain terminal string. No ANSI sequences or Blessed tags are added.
 *
 * @throws `RangeError`
 * Thrown when `width` is not a positive integer.
 *
 * @throws `RangeError`
 * Thrown when `min` or `max` is not finite, or when `max` is not greater than
 * `min`.
 *
 * @throws `RangeError`
 * Thrown when `value` is not finite.
 *
 * @example Unicode output
 *
 * ```ts
 * import { renderProgressBar } from 'blessed-components/progress-bar';
 *
 * const output = renderProgressBar({
 *   label: 'Quality',
 *   value: 78,
 *   width: 16,
 * });
 *
 * // "Quality ████████████░░░░ 78%"
 * ```
 *
 * @example ASCII output with a custom value
 *
 * ```ts
 * const output = renderProgressBar({
 *   characters: { filled: '#', empty: '-' },
 *   formatValue: ({ value }) => `${value} files`,
 *   label: 'Uploaded',
 *   value: 25,
 *   width: 8,
 * });
 *
 * // "Uploaded ##------ 25 files"
 * ```
 */
export function renderProgressBar({
  characters = { empty: '░', filled: '█' },
  formatValue = ({ percentage }) => `${percentage}%`,
  label,
  max = 100,
  min = 0,
  value,
  width,
}: RenderProgressBarOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('ProgressBar width must be a positive integer.');
  }

  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    throw new RangeError('ProgressBar max must be greater than min.');
  }

  if (!Number.isFinite(value)) {
    throw new RangeError('ProgressBar value must be finite.');
  }

  const domain = { max, min };
  const clampedValue = clamp(value, min, max);
  const percentage = Math.round(normalizeValue(clampedValue, domain) * 100);
  const filledWidth = Math.round((percentage / 100) * width);
  const track =
    characters.filled.repeat(filledWidth) + characters.empty.repeat(width - filledWidth);
  const prefix = label === undefined ? '' : `${label} `;
  const valueText = formatValue({ percentage, value: clampedValue });

  return `${prefix}${track} ${valueText}`;
}

import { clamp, normalizeValue } from '../../../core/scale.js';
