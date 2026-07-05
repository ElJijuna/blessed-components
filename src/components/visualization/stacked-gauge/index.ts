import { stripBlessedTags } from '@/core/tags.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Default Unicode characters used for StackedGauge segments. */
export const STACKED_GAUGE_UNICODE_CHARACTERS = Object.freeze(['█', '▓', '▒', '░']);

/** Default ASCII characters used for StackedGauge segments. */
export const STACKED_GAUGE_ASCII_CHARACTERS = Object.freeze(['#', '=', '+', '-']);

/** Character tokens used by {@link renderStackedGauge}. */
export interface StackedGaugeCharacters {
  /** Character repeated for unfilled track cells. */
  empty: string;

  /** Characters used for segments without explicit characters. */
  segments: readonly string[];

  /** Character rendered after the track. */
  rightCap: string;

  /** Character rendered before the track. */
  leftCap: string;
}

/** One proportional segment rendered by {@link renderStackedGauge}. */
export interface StackedGaugeSegment {
  /** Optional explicit one-cell track character. */
  character?: string;

  /** Stable segment identifier. */
  id: string;

  /** Non-empty segment label. */
  label: string;

  /** Non-negative segment value. */
  value: number;
}

/** Computed segment information passed to value formatters. */
export interface StackedGaugeValueContext {
  /** Rounded percentage of the configured total. */
  percentage: number;

  /** Original segment value. */
  value: number;
}

/** Options accepted by {@link renderStackedGauge}. */
export interface RenderStackedGaugeOptions {
  /**
   * Characters used to render the stacked gauge.
   *
   * @defaultValue `{ empty: '░', leftCap: '[', rightCap: ']', segments: STACKED_GAUGE_UNICODE_CHARACTERS }`
   */
  characters?: StackedGaugeCharacters;

  /**
   * Formats legend value text.
   *
   * @defaultValue `({ percentage }) => `${percentage}%``
   */
  formatValue?: (context: StackedGaugeValueContext) => string;

  /** Maximum rendered line count. */
  height?: number;

  /** Optional text rendered before the gauge track. */
  label?: string;

  /**
   * Whether legend rows are rendered under the track.
   *
   * @defaultValue `true`
   */
  showLegend?: boolean;

  /** Ordered segments to render. */
  segments: readonly StackedGaugeSegment[];

  /**
   * Total value represented by the full track.
   *
   * Defaults to the sum of segment values.
   */
  total?: number;

  /** Positive integer width reserved for the gauge track. */
  width: number;
}

const DEFAULT_CHARACTERS: StackedGaugeCharacters = {
  empty: '░',
  leftCap: '[',
  rightCap: ']',
  segments: STACKED_GAUGE_UNICODE_CHARACTERS,
};

interface NormalizedSegment {
  character: string;
  label: string;
  percentage: number;
  value: number;
  width: number;
}

function sanitizeText(value: string): string {
  return stripBlessedTags(stripAnsi(value)).trim();
}

function assertOneCell(value: string, message: string): void {
  if (visibleWidth(value) !== 1) {
    throw new RangeError(message);
  }
}

function allocateWidths(values: readonly number[], total: number, width: number): number[] {
  const rawWidths = values.map((value) => (value / total) * width);
  const widths = rawWidths.map(Math.floor);
  const usedWidth = Math.round((values.reduce((sum, value) => sum + value, 0) / total) * width);

  let remaining = usedWidth - widths.reduce((sum, value) => sum + value, 0);

  const order = rawWidths
    .map((value, index) => ({ index, remainder: value - Math.floor(value) }))
    .sort((left, right) => right.remainder - left.remainder);

  for (const { index } of order) {
    if (remaining <= 0) {
      break;
    }

    widths[index] = (widths[index] ?? 0) + 1;
    remaining -= 1;
  }

  return widths;
}

/**
 * Renders a compact stacked gauge with optional legend rows.
 *
 * StackedGauge is intended for part-to-whole summaries where one gauge track
 * carries several categories. Segment characters keep the composition readable
 * without relying on color.
 */
export function renderStackedGauge({
  characters = DEFAULT_CHARACTERS,
  formatValue = ({ percentage }) => `${percentage}%`,
  height,
  label,
  segments,
  showLegend = true,
  total,
  width,
}: RenderStackedGaugeOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('StackedGauge width must be a positive integer.');
  }

  if (height !== undefined && (!Number.isInteger(height) || height < 0)) {
    throw new RangeError('StackedGauge height must be a non-negative integer.');
  }

  if (segments.length === 0) {
    throw new RangeError('StackedGauge segments must be non-empty.');
  }

  if (characters.segments.length === 0) {
    throw new RangeError('StackedGauge segment characters must be non-empty.');
  }

  assertOneCell(characters.empty, 'StackedGauge characters must be one terminal cell wide.');
  assertOneCell(characters.leftCap, 'StackedGauge characters must be one terminal cell wide.');
  assertOneCell(characters.rightCap, 'StackedGauge characters must be one terminal cell wide.');

  const [fallbackCharacter] = characters.segments;

  if (fallbackCharacter === undefined) {
    throw new RangeError('StackedGauge segment characters must be non-empty.');
  }

  for (const character of characters.segments) {
    assertOneCell(character, 'StackedGauge characters must be one terminal cell wide.');
  }

  const sanitized = segments.map((segment, index) => {
    const labelText = sanitizeText(segment.label);

    if (labelText.length === 0) {
      throw new RangeError('StackedGauge labels must be non-empty.');
    }

    if (!Number.isFinite(segment.value) || segment.value < 0) {
      throw new RangeError('StackedGauge segment values must be non-negative.');
    }

    const character =
      segment.character ??
      characters.segments[index % characters.segments.length] ??
      fallbackCharacter;

    assertOneCell(character, 'StackedGauge characters must be one terminal cell wide.');

    return {
      character,
      label: labelText,
      value: segment.value,
    };
  });
  const valueSum = sanitized.reduce((sum, segment) => sum + segment.value, 0);
  const resolvedTotal = total ?? valueSum;

  if (!Number.isFinite(resolvedTotal) || resolvedTotal <= 0 || resolvedTotal < valueSum) {
    throw new RangeError('StackedGauge total must be positive and at least the segment sum.');
  }

  const widths = allocateWidths(
    sanitized.map((segment) => segment.value),
    resolvedTotal,
    width,
  );
  const normalized: NormalizedSegment[] = sanitized.map((segment, index) => ({
    ...segment,
    percentage: Math.round((segment.value / resolvedTotal) * 100),
    width: widths[index] ?? 0,
  }));
  const usedWidth = widths.reduce((sum, value) => sum + value, 0);
  const trackContent =
    normalized.map((segment) => segment.character.repeat(segment.width)).join('') +
    characters.empty.repeat(Math.max(0, width - usedWidth));
  const prefix = label === undefined ? '' : `${sanitizeText(label)} `;
  const track = `${prefix}${characters.leftCap}${trackContent}${characters.rightCap}`;
  const legend = showLegend
    ? normalized.map((segment) => {
        const valueText = sanitizeText(
          formatValue({ percentage: segment.percentage, value: segment.value }),
        );

        return `${segment.character} ${segment.label} ${valueText}`;
      })
    : [];
  const lines = [track, ...legend];
  const boundedLines = height === undefined ? lines : lines.slice(0, height);

  return boundedLines.join('\n');
}
