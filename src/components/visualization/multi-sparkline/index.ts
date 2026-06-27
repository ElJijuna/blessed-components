import { renderSparkline } from '@/components/visualization/sparkline/index.js';
import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** One series rendered by {@link renderMultiSparkline}. */
export interface MultiSparklineSeries {
  /** Stable series identifier. */
  id: string;

  /** Visible row label. */
  label: string;

  /** Optional text appended after the sparkline. */
  summary?: string;

  /** Ordered finite numeric samples. */
  values: readonly number[];
}

/** Options accepted by {@link renderMultiSparkline}. */
export interface RenderMultiSparklineOptions {
  /**
   * Ordered glyph scale from lowest to highest intensity.
   *
   * @defaultValue Sparkline's default Unicode block scale.
   */
  characters?: readonly string[];

  /**
   * Text returned when `series` is empty.
   *
   * @defaultValue `'No series'`
   */
  emptyText?: string;

  /**
   * Width reserved for each label.
   *
   * `auto` uses the widest label.
   *
   * @defaultValue `'auto'`
   */
  labelWidth?: 'auto' | number;

  /** Explicit upper domain bound shared by all rows. */
  max?: number;

  /** Explicit lower domain bound shared by all rows. */
  min?: number;

  /** Ordered series rows. Caller-owned data is never mutated. */
  series: readonly MultiSparklineSeries[];

  /**
   * Positive integer maximum number of graph cells per row.
   */
  width: number;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function padEnd(value: string, width: number): string {
  return `${value}${' '.repeat(Math.max(0, width - visibleWidth(value)))}`;
}

/**
 * Renders aligned compact sparklines for multiple series.
 *
 * All rows share one numeric domain so their glyph intensity is comparable.
 * Labels are aligned before each row delegates to {@link renderSparkline}.
 *
 * @param options - Series, shared domain, label width, glyphs, and graph width.
 * @returns Plain terminal text without ANSI sequences or Blessed tags.
 */
export function renderMultiSparkline({
  characters,
  emptyText = 'No series',
  labelWidth = 'auto',
  max: configuredMax,
  min: configuredMin,
  series,
  width,
}: RenderMultiSparklineOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('MultiSparkline width must be a positive integer.');
  }

  if (series.length === 0) {
    return plainText(emptyText);
  }

  if (labelWidth !== 'auto' && (!Number.isInteger(labelWidth) || labelWidth < 1)) {
    throw new RangeError('MultiSparkline label width must be a positive integer or auto.');
  }

  const normalizedSeries = series.map((item) => {
    const label = plainText(item.label);

    if (item.id.length === 0 || /[\r\n]/u.test(item.id)) {
      throw new RangeError('MultiSparkline series ids must be non-empty and fit on one line.');
    }

    if (label.length === 0 || /[\r\n]/u.test(label)) {
      throw new RangeError('MultiSparkline labels must be non-empty and fit on one line.');
    }

    return {
      ...item,
      label,
      summary: item.summary === undefined ? undefined : plainText(item.summary),
    };
  });
  const allValues = normalizedSeries.flatMap(({ values }) => [...values]);

  if (allValues.length === 0) {
    return plainText(emptyText);
  }

  const min = configuredMin ?? Math.min(...allValues);
  const max = configuredMax ?? Math.max(...allValues);

  if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
    throw new RangeError('MultiSparkline max must be greater than or equal to min.');
  }

  if ((configuredMin !== undefined || configuredMax !== undefined) && max === min) {
    throw new RangeError('MultiSparkline explicit max must be greater than min.');
  }

  const resolvedLabelWidth =
    labelWidth === 'auto'
      ? Math.max(...normalizedSeries.map(({ label }) => visibleWidth(label)))
      : labelWidth;

  return normalizedSeries
    .map((item) => {
      const fittedLabel =
        visibleWidth(item.label) > resolvedLabelWidth
          ? truncateText(item.label, resolvedLabelWidth)
          : item.label;
      const label = padEnd(fittedLabel, resolvedLabelWidth);
      const domain = min === max ? {} : { max, min };
      const sparkline = renderSparkline({
        ...(characters === undefined ? {} : { characters }),
        ...domain,
        emptyText,
        ...(item.summary === undefined ? {} : { summary: item.summary }),
        values: item.values,
        width,
      });

      return `${label} ${sparkline}`;
    })
    .join('\n');
}
