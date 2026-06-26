import { stripBlessedTags } from '@/core/tags.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Default Unicode characters used for ProgressStack segments. */
export const PROGRESS_STACK_UNICODE_CHARACTERS = Object.freeze(['█', '▓', '▒', '░']);

/** Default ASCII characters used for ProgressStack segments. */
export const PROGRESS_STACK_ASCII_CHARACTERS = Object.freeze(['#', '=', '+', '-']);

/** One proportional segment rendered by {@link renderProgressStack}. */
export interface ProgressStackSegment {
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
export interface ProgressStackValueContext {
  /** Rounded percentage of the configured total. */
  percentage: number;

  /** Original segment value. */
  value: number;
}

/** Options accepted by {@link renderProgressStack}. */
export interface RenderProgressStackOptions {
  /**
   * Characters used for segments without an explicit character.
   *
   * @defaultValue `PROGRESS_STACK_UNICODE_CHARACTERS`
   */
  characters?: readonly string[];

  /**
   * Formats legend value text.
   *
   * @defaultValue `({ percentage }) => `${percentage}%``
   */
  formatValue?: (context: ProgressStackValueContext) => string;

  /** Maximum rendered line count. */
  height?: number;

  /**
   * Whether legend rows are rendered under the track.
   *
   * @defaultValue `true`
   */
  showLegend?: boolean;

  /** Ordered segments to render. */
  segments: readonly ProgressStackSegment[];

  /**
   * Total value represented by the full track.
   *
   * Defaults to the sum of segment values.
   */
  total?: number;

  /** Fixed track width measured in terminal cells. */
  width: number;
}

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
 * Renders one segmented progress track and optional legend rows.
 *
 * ProgressStack is intended for category composition where each segment is a
 * part of one bounded whole. Characters keep segments distinguishable without
 * relying on color.
 */
export function renderProgressStack({
  characters = PROGRESS_STACK_UNICODE_CHARACTERS,
  formatValue = ({ percentage }) => `${percentage}%`,
  height,
  segments,
  showLegend = true,
  total,
  width,
}: RenderProgressStackOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('ProgressStack width must be a positive integer.');
  }

  if (height !== undefined && (!Number.isInteger(height) || height < 0)) {
    throw new RangeError('ProgressStack height must be a non-negative integer.');
  }

  if (segments.length === 0) {
    throw new RangeError('ProgressStack segments must be non-empty.');
  }

  if (characters.length === 0) {
    throw new RangeError('ProgressStack characters must be non-empty.');
  }

  const [fallbackCharacter] = characters;

  if (fallbackCharacter === undefined) {
    throw new RangeError('ProgressStack characters must be non-empty.');
  }

  for (const character of characters) {
    assertOneCell(character, 'ProgressStack characters must be one terminal cell wide.');
  }

  const sanitized = segments.map((segment, index) => {
    const label = sanitizeText(segment.label);

    if (label.length === 0) {
      throw new RangeError('ProgressStack labels must be non-empty.');
    }

    if (!Number.isFinite(segment.value) || segment.value < 0) {
      throw new RangeError('ProgressStack segment values must be non-negative.');
    }

    const character =
      segment.character ?? characters[index % characters.length] ?? fallbackCharacter;

    assertOneCell(character, 'ProgressStack characters must be one terminal cell wide.');

    return {
      character,
      label,
      value: segment.value,
    };
  });
  const valueSum = sanitized.reduce((sum, segment) => sum + segment.value, 0);
  const resolvedTotal = total ?? valueSum;

  if (!Number.isFinite(resolvedTotal) || resolvedTotal <= 0 || resolvedTotal < valueSum) {
    throw new RangeError('ProgressStack total must be positive and at least the segment sum.');
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
  const track =
    normalized.map((segment) => segment.character.repeat(segment.width)).join('') +
    ' '.repeat(Math.max(0, width - usedWidth));
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
