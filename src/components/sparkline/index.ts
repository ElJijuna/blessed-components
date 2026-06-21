const DEFAULT_CHARACTERS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'] as const;

/**
 * Options accepted by {@link renderSparkline}.
 *
 * Samples are kept in input order, scaled into `characters`, and reduced to at
 * most `width` cells. Values outside an explicit domain are clamped.
 */
export interface RenderSparklineOptions {
  /**
   * Ordered glyph scale from lowest to highest intensity.
   *
   * At least two non-empty strings are required. Glyphs should occupy one
   * terminal cell to keep output width predictable.
   *
   * @defaultValue `['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']`
   */
  characters?: readonly string[];

  /**
   * Text returned when `values` is empty.
   *
   * Metadata is not rendered for an empty series.
   *
   * @defaultValue `'No data'`
   */
  emptyText?: string;

  /** Optional heading label rendered above the graph. */
  label?: string;

  /**
   * Explicit upper domain bound.
   *
   * When omitted, the largest input value is used. If either explicit bound is
   * supplied, the resolved `max` must be greater than the resolved `min`.
   */
  max?: number;

  /**
   * Explicit lower domain bound.
   *
   * When omitted, the smallest input value is used.
   */
  min?: number;

  /** Optional text appended to the graph line after one space. */
  summary?: string;

  /**
   * Optional primary value rendered next to `label`.
   *
   * This value is presentation metadata and does not affect graph scaling.
   */
  value?: number | string;

  /**
   * Ordered finite numeric samples.
   *
   * The input array is never mutated.
   */
  values: readonly number[];

  /**
   * Positive integer maximum number of graph cells.
   *
   * Longer series are downsampled. Shorter series are not padded.
   */
  width: number;
}

/**
 * Renders a deterministic terminal sparkline.
 *
 * This pure renderer does not import Blessed. Use the
 * `blessed-components/sparkline` subpath to keep the Blessed adapter outside
 * the module graph.
 *
 * When downsampling is required, the series is divided into ordered buckets
 * and each bucket keeps its maximum value. This preserves narrow peaks. A
 * constant series uses the middle glyph to avoid division by zero.
 *
 * Output shape:
 *
 * ```text
 * [optional label and value]
 * [graph][optional summary]
 * ```
 *
 * With no metadata, only the graph line is returned.
 *
 * @param options - Series, domain, width, glyphs, and optional metadata.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown when `width` is not a positive integer.
 *
 * @throws `RangeError`
 * Thrown when fewer than two non-empty characters are provided.
 *
 * @throws `RangeError`
 * Thrown when any sample or domain bound is not finite.
 *
 * @throws `RangeError`
 * Thrown when an explicit domain does not have `max > min`.
 *
 * @example Basic series
 *
 * ```ts
 * import { renderSparkline } from 'blessed-components/sparkline';
 *
 * renderSparkline({
 *   values: [1, 2, 3, 4, 5, 6, 7, 8],
 *   width: 8,
 * });
 * // "▁▂▃▄▅▆▇█"
 * ```
 *
 * @example Metadata and summary
 *
 * ```ts
 * renderSparkline({
 *   label: 'Downloads',
 *   value: '25.2M',
 *   values: [1, 3, 2, 8],
 *   width: 4,
 *   summary: 'peak: 8M',
 * });
 * // "Downloads 25.2M\n▁▃▂█ peak: 8M"
 * ```
 */
export function renderSparkline({
  characters = DEFAULT_CHARACTERS,
  emptyText = 'No data',
  label,
  max: configuredMax,
  min: configuredMin,
  summary,
  value: displayValue,
  values,
  width,
}: RenderSparklineOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('Sparkline width must be a positive integer.');
  }

  if (characters.length < 2 || characters.some((character) => character.length === 0)) {
    throw new RangeError('Sparkline characters must contain at least two non-empty strings.');
  }

  if (values.some((value) => !Number.isFinite(value))) {
    throw new RangeError('Sparkline values must be finite.');
  }

  if (values.length === 0) {
    return emptyText;
  }

  const min = configuredMin ?? Math.min(...values);
  const max = configuredMax ?? Math.max(...values);

  if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
    throw new RangeError('Sparkline max must be greater than or equal to min.');
  }

  if ((configuredMin !== undefined || configuredMax !== undefined) && max === min) {
    throw new RangeError('Sparkline explicit max must be greater than min.');
  }

  const constantIndex = Math.floor((characters.length - 1) / 2);
  const samples =
    values.length <= width
      ? values
      : Array.from({ length: width }, (_, index) => {
          const start = Math.floor((index * values.length) / width);
          const end = Math.floor(((index + 1) * values.length) / width);

          return Math.max(...values.slice(start, end));
        });
  const sparkline = samples
    .map((value) => {
      if (min === max) {
        return characters[constantIndex];
      }

      const clampedValue = Math.min(max, Math.max(min, value));
      const ratio = (clampedValue - min) / (max - min);
      const index =
        clampedValue >= max ? characters.length - 1 : Math.floor(ratio * (characters.length - 1));

      return characters[index];
    })
    .join('');
  const heading = [label, displayValue].filter((part) => part !== undefined).join(' ');
  const chartLine = summary === undefined ? sparkline : `${sparkline} ${summary}`;

  return heading.length === 0 ? chartLine : `${heading}\n${chartLine}`;
}
