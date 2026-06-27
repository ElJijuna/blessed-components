import {
  resolveThreshold,
  type ThresholdRange,
} from '@/components/visualization/thresholds/index.js';
import { clamp, normalizeValue } from '@/core/scale.js';
import { stripBlessedTags } from '@/core/tags.js';
import { stripAnsi } from '@/core/width.js';

/** Character tokens used by {@link renderGauge}. */
export interface GaugeCharacters {
  /** Character repeated for unfilled track cells. */
  empty: string;

  /** Character repeated for filled track cells. */
  filled: string;

  /** Character rendered after the track. */
  rightCap: string;

  /** Character rendered before the track. */
  leftCap: string;
}

/** Normalized value information passed to a gauge value formatter. */
export interface GaugeValueContext {
  /** Rounded progress in the inclusive range from `0` to `100`. */
  percentage: number;

  /** Matching threshold, if any. */
  threshold?: ThresholdRange;

  /** Numeric value after it has been clamped to the configured range. */
  value: number;
}

/** Options accepted by {@link renderGauge}. */
export interface RenderGaugeOptions {
  /**
   * Characters used to render the gauge track.
   *
   * @defaultValue `{ filled: '█', empty: '░', leftCap: '[', rightCap: ']' }`
   */
  characters?: GaugeCharacters;

  /**
   * Formats the value text appended after the track.
   *
   * @defaultValue `({ percentage }) => `${percentage}%``
   */
  formatValue?: (context: GaugeValueContext) => string;

  /** Optional text rendered before the gauge track. */
  label?: string;

  /**
   * Upper bound of the numeric range.
   *
   * @defaultValue `100`
   */
  max?: number;

  /**
   * Lower bound of the numeric range.
   *
   * @defaultValue `0`
   */
  min?: number;

  /** Ordered qualitative ranges matched against the clamped value. */
  thresholds?: readonly ThresholdRange[];

  /** Current finite numeric value. */
  value: number;

  /** Positive integer width reserved for the gauge track. */
  width: number;
}

const DEFAULT_CHARACTERS: GaugeCharacters = {
  empty: '░',
  filled: '█',
  leftCap: '[',
  rightCap: ']',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

/**
 * Renders a deterministic, single-line bounded gauge.
 *
 * This renderer is framework-independent and does not import Blessed. It
 * clamps values into the configured range, renders a fixed-width track, and
 * appends the first matching threshold label as plain text so the state remains
 * visible without terminal color.
 *
 * @param options - Numeric range, track width, thresholds, and formatting.
 * @returns Plain terminal text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown for invalid dimensions, non-finite values, invalid ranges, or invalid
 * threshold ranges.
 */
export function renderGauge({
  characters = DEFAULT_CHARACTERS,
  formatValue = ({ percentage }) => `${percentage}%`,
  label,
  max = 100,
  min = 0,
  thresholds,
  value,
  width,
}: RenderGaugeOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('Gauge width must be a positive integer.');
  }

  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    throw new RangeError('Gauge max must be greater than min.');
  }

  if (!Number.isFinite(value)) {
    throw new RangeError('Gauge value must be finite.');
  }

  const clampedValue = clamp(value, min, max);
  const percentage = Math.round(normalizeValue(clampedValue, { max, min }) * 100);
  const filledWidth = Math.round((percentage / 100) * width);
  const threshold = resolveThreshold({
    max,
    min,
    thresholds: thresholds ?? [],
    value: clampedValue,
  });
  const context: GaugeValueContext =
    threshold === undefined
      ? { percentage, value: clampedValue }
      : { percentage, threshold, value: clampedValue };
  const track = `${characters.leftCap}${characters.filled.repeat(filledWidth)}${characters.empty.repeat(
    width - filledWidth,
  )}${characters.rightCap}`;
  const prefix = label === undefined ? '' : `${plainText(label)} `;
  const thresholdText = threshold === undefined ? '' : ` ${plainText(threshold.label)}`;

  return `${prefix}${track} ${plainText(formatValue(context))}${thresholdText}`;
}
