import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Qualitative tone names commonly used by threshold ranges. */
export type ThresholdTone = 'critical' | 'danger' | 'info' | 'neutral' | 'success' | 'warning';

/** One qualitative numeric range. */
export interface ThresholdRange {
  /** Inclusive upper bound. Defaults to the supplied domain max. */
  end?: number;

  /** Human-readable range label. */
  label: string;

  /** Marker rendered before the label. */
  marker?: string;

  /** Inclusive lower bound. Defaults to the supplied domain min. */
  start?: number;

  /** Semantic meaning available to adapters and formatter callbacks. */
  tone?: ThresholdTone;
}

/** Context passed to threshold range formatters. */
export interface ThresholdFormatContext {
  /** Resolved inclusive upper bound. */
  end: number;

  /** Whether this range matches `value`. */
  active: boolean;

  /** Resolved inclusive lower bound. */
  start: number;

  /** Original threshold range. */
  threshold: ThresholdRange;
}

/** Options accepted by {@link resolveThreshold}. */
export interface ResolveThresholdOptions {
  /** Upper domain bound. */
  max: number;

  /** Lower domain bound. */
  min: number;

  /** Ordered qualitative ranges. */
  thresholds: readonly ThresholdRange[];

  /** Value matched against the ranges. */
  value: number;
}

/** Options accepted by {@link renderThresholds}. */
export interface RenderThresholdsOptions {
  /**
   * Text returned when `thresholds` is empty.
   *
   * @defaultValue `'No thresholds'`
   */
  emptyText?: string;

  /**
   * Formats each resolved range.
   *
   * @defaultValue `({ start, end }) => `${start}..${end}``
   */
  formatRange?: (context: ThresholdFormatContext) => string;

  /** Upper domain bound. */
  max: number;

  /** Lower domain bound. */
  min: number;

  /**
   * Separator used between horizontal ranges.
   *
   * @defaultValue `'  '`
   */
  separator?: string;

  /** Ordered qualitative ranges. */
  thresholds: readonly ThresholdRange[];

  /** Optional value used to mark one active range. */
  value?: number;

  /** Optional maximum width of each rendered line. */
  width?: number;
}

const DEFAULT_MARKERS: Record<ThresholdTone, string> = {
  critical: '×',
  danger: '×',
  info: 'i',
  neutral: '•',
  success: '✓',
  warning: '!',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function assertDomain(min: number, max: number): void {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    throw new RangeError('Thresholds max must be greater than min.');
  }
}

function resolveBounds(
  threshold: ThresholdRange,
  min: number,
  max: number,
): { end: number; start: number } {
  const start = threshold.start ?? min;
  const end = threshold.end ?? max;

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    throw new RangeError('Threshold ranges must be finite and ordered.');
  }

  return { end, start };
}

function markerFor(threshold: ThresholdRange): string {
  return (
    threshold.marker ??
    (threshold.tone === undefined ? DEFAULT_MARKERS.neutral : DEFAULT_MARKERS[threshold.tone])
  );
}

function fitLine(line: string, width?: number): string {
  if (width === undefined) {
    return line;
  }

  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('Thresholds width must be a non-negative integer.');
  }

  return truncateText(line, width);
}

/**
 * Resolves the first threshold containing `value`.
 *
 * Ranges are inclusive. Missing `start` or `end` values inherit the supplied
 * domain bounds. This helper is shared by bounded visualizations such as Gauge
 * and BulletChart.
 *
 * @param options - Domain, value, and ordered ranges.
 * @returns The first matching threshold, or `undefined`.
 */
export function resolveThreshold({
  max,
  min,
  thresholds,
  value,
}: ResolveThresholdOptions): ThresholdRange | undefined {
  assertDomain(min, max);

  if (!Number.isFinite(value)) {
    throw new RangeError('Threshold value must be finite.');
  }

  return thresholds.find((threshold) => {
    const { end, start } = resolveBounds(threshold, min, max);

    return value >= start && value <= end;
  });
}

/**
 * Renders qualitative threshold ranges as terminal text.
 *
 * Output remains meaningful without color by including a marker for every
 * range and wrapping the active range in brackets when `value` is provided.
 *
 * @param options - Domain, ranges, optional active value, formatting, and width.
 * @returns Plain terminal text without ANSI sequences or Blessed tags.
 */
export function renderThresholds({
  emptyText = 'No thresholds',
  formatRange = ({ end, start }) => `${start}..${end}`,
  max,
  min,
  separator = '  ',
  thresholds,
  value,
  width,
}: RenderThresholdsOptions): string {
  assertDomain(min, max);

  if (value !== undefined && !Number.isFinite(value)) {
    throw new RangeError('Threshold value must be finite.');
  }

  if (thresholds.length === 0) {
    return fitLine(plainText(emptyText), width);
  }

  const rows = thresholds.map((threshold) => {
    if (threshold.label.length === 0) {
      throw new RangeError('Threshold labels must be non-empty.');
    }

    const marker = plainText(markerFor(threshold));

    if (marker.length === 0) {
      throw new RangeError('Threshold markers must be non-empty.');
    }

    const { end, start } = resolveBounds(threshold, min, max);
    const active = value === undefined ? false : value >= start && value <= end;
    const text = `${marker} ${plainText(threshold.label)} ${plainText(
      formatRange({ active, end, start, threshold }),
    )}`;

    return active ? `[${text}]` : text;
  });

  return fitLine(rows.join(plainText(separator)), width);
}
