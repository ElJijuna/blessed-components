import { fitPlain, renderPlainLines } from '@/components/shared/text.js';
import { normalizeValue, sampleSeries } from '@/core/scale.js';

/** Series rendered by {@link renderLineChart}. */
export interface LineChartSeries {
  /** Series label. */
  label: string;

  /** Ordered numeric values. */
  values: readonly number[];
}

/** Options accepted by {@link renderLineChart}. */
export interface RenderLineChartOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Maximum domain value. Defaults to max series value or 1. */
  max?: number;

  /** Minimum domain value. Defaults to min series value or 0. */
  min?: number;

  /** One or more series. */
  series: readonly LineChartSeries[];

  /** Number of sampled cells per series. */
  width: number;
}

const BLOCKS = ['_', '.', ':', '-', '=', '+', '*', '#'];

/** Renders sampled line-series trends as compact glyph rows. */
export function renderLineChart({
  height,
  max,
  min,
  series,
  width,
}: RenderLineChartOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('LineChart width must be a positive integer.');
  }

  const values = series.flatMap((item) => [...item.values]);
  const domainMin = min ?? Math.min(0, ...values);
  const domainMax = max ?? Math.max(1, ...values);

  if (!Number.isFinite(domainMin) || !Number.isFinite(domainMax) || domainMax <= domainMin) {
    throw new RangeError('LineChart max must be greater than min.');
  }

  const lines = series.map((item) => {
    const sampled = sampleSeries(item.values, width, { strategy: 'last' });
    const glyphs = sampled
      .map((value) => {
        const index = Math.round(normalizeValue(value, { max: domainMax, min: domainMin }) * 7);

        return BLOCKS[index] ?? '#';
      })
      .join('');

    return `${fitPlain(item.label)}: ${glyphs}`;
  });

  return renderPlainLines(lines, { height });
}
