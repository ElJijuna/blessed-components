import { clamp, normalizeValue } from '@/core/scale.js';
import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';
import type { ProgressBarCharacters, ProgressBarValueContext } from '../progress-bar/index.js';

/** One row rendered by {@link renderProgressList}. */
export interface ProgressListItem {
  /** Optional per-row formatted value. */
  formatValue?: (context: ProgressBarValueContext) => string;

  /** Stable row identifier. */
  id: string;

  /** Non-empty row label. */
  label: string;

  /** Optional per-row upper bound. */
  max?: number;

  /** Optional per-row lower bound. */
  min?: number;

  /** Current numeric value. */
  value: number;
}

/** Options accepted by {@link renderProgressList}. */
export interface RenderProgressListOptions {
  /**
   * Characters used to render filled and empty cells.
   *
   * @defaultValue `{ filled: '█', empty: '░' }`
   */
  characters?: ProgressBarCharacters;

  /**
   * Formats row value text.
   *
   * @defaultValue `({ percentage }) => `${percentage}%``
   */
  formatValue?: (context: ProgressBarValueContext) => string;

  /** Maximum rendered line count. */
  height?: number;

  /** Ordered rows to render. */
  items: readonly ProgressListItem[];

  /**
   * Gap between label and track.
   *
   * @defaultValue `1`
   */
  labelGap?: number;

  /** Fixed label width. Defaults to the widest sanitized label. */
  labelWidth?: number;

  /** Default upper bound for rows. @defaultValue `100` */
  max?: number;

  /** Default lower bound for rows. @defaultValue `0` */
  min?: number;

  /**
   * Whether value text is rendered after the track.
   *
   * @defaultValue `true`
   */
  showValue?: boolean;

  /**
   * Fixed track width. Defaults to available `width`, or `10`.
   */
  trackWidth?: number;

  /**
   * Gap between track and value.
   *
   * @defaultValue `1`
   */
  valueGap?: number;

  /** Maximum rendered row width measured in terminal cells. */
  width?: number;
}

interface NormalizedProgressListItem {
  label: string;
  percentage: number;
  value: number;
  valueText: string;
}

function sanitizeText(value: string): string {
  return stripBlessedTags(stripAnsi(value)).trim();
}

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(`${name} must be a positive integer.`);
  }
}

function normalizeItem(
  item: ProgressListItem,
  options: {
    formatValue: (context: ProgressBarValueContext) => string;
    max: number;
    min: number;
  },
): NormalizedProgressListItem {
  const min = item.min ?? options.min;
  const max = item.max ?? options.max;

  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    throw new RangeError('ProgressList max must be greater than min.');
  }

  if (!Number.isFinite(item.value)) {
    throw new RangeError('ProgressList item values must be finite.');
  }

  const label = sanitizeText(item.label);

  if (label.length === 0) {
    throw new RangeError('ProgressList labels must be non-empty.');
  }

  const value = clamp(item.value, min, max);
  const percentage = Math.round(normalizeValue(value, { max, min }) * 100);
  const formatValue = item.formatValue ?? options.formatValue;

  return {
    label,
    percentage,
    value,
    valueText: sanitizeText(formatValue({ percentage, value })),
  };
}

function padRight(value: string, width: number): string {
  return `${value}${' '.repeat(Math.max(0, width - visibleWidth(value)))}`;
}

function renderTrack(percentage: number, width: number, characters: ProgressBarCharacters): string {
  const filledWidth = Math.round((percentage / 100) * width);

  return characters.filled.repeat(filledWidth) + characters.empty.repeat(width - filledWidth);
}

/**
 * Renders multiple labeled progress rows.
 *
 * ProgressList shares the same numeric normalization as ProgressBar, while
 * aligning labels and value text across rows for scan-friendly terminal
 * output.
 */
export function renderProgressList({
  characters = { empty: '░', filled: '█' },
  formatValue = ({ percentage }) => `${percentage}%`,
  height,
  items,
  labelGap = 1,
  labelWidth,
  max = 100,
  min = 0,
  showValue = true,
  trackWidth,
  valueGap = 1,
  width,
}: RenderProgressListOptions): string {
  if (items.length === 0) {
    throw new RangeError('ProgressList items must be non-empty.');
  }

  if (width !== undefined) {
    assertPositiveInteger(width, 'ProgressList width');
  }

  if (height !== undefined) {
    assertNonNegativeInteger(height, 'ProgressList height');
  }

  if (labelWidth !== undefined) {
    assertNonNegativeInteger(labelWidth, 'ProgressList labelWidth');
  }

  if (trackWidth !== undefined) {
    assertPositiveInteger(trackWidth, 'ProgressList trackWidth');
  }

  assertNonNegativeInteger(labelGap, 'ProgressList labelGap');
  assertNonNegativeInteger(valueGap, 'ProgressList valueGap');

  const normalizedItems = items.map((item) => normalizeItem(item, { formatValue, max, min }));
  const resolvedLabelWidth =
    labelWidth ?? Math.max(...normalizedItems.map((item) => visibleWidth(item.label)));
  const valueWidth = showValue
    ? Math.max(...normalizedItems.map((item) => visibleWidth(item.valueText)))
    : 0;
  const resolvedTrackWidth =
    trackWidth ??
    (width === undefined
      ? 10
      : Math.max(
          1,
          width - resolvedLabelWidth - labelGap - (showValue ? valueGap + valueWidth : 0),
        ));
  const rows = normalizedItems.map((item) => {
    const label = padRight(truncateText(item.label, resolvedLabelWidth), resolvedLabelWidth);
    const track = renderTrack(item.percentage, resolvedTrackWidth, characters);
    const valueText = showValue ? padRight(item.valueText, valueWidth) : '';
    const row = [
      label,
      ' '.repeat(labelGap),
      track,
      ...(showValue ? [' '.repeat(valueGap), valueText] : []),
    ].join('');

    return width === undefined ? row.trimEnd() : truncateText(row.trimEnd(), width);
  });
  const boundedRows = height === undefined ? rows : rows.slice(0, height);

  return boundedRows.join('\n');
}
