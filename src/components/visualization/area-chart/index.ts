import { renderPlainLines } from '@/components/shared/text.js';
import { normalizeValue, sampleSeries } from '@/core/scale.js';

/** Options accepted by {@link renderAreaChart}. */
export interface RenderAreaChartOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Maximum domain value. */
  max?: number;

  /** Minimum domain value. */
  min?: number;

  /** Ordered values. */
  values: readonly number[];

  /** Sample width. */
  width: number;
}

const AREA = [' ', '.', ':', '-', '=', '+', '*', '#'];

/** Renders a filled trend as sampled intensity cells. */
export function renderAreaChart({
  height,
  max,
  min,
  values,
  width,
}: RenderAreaChartOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('AreaChart width must be positive.');
  }

  const domainMin = min ?? Math.min(0, ...values);
  const domainMax = max ?? Math.max(1, ...values);

  if (!Number.isFinite(domainMin) || !Number.isFinite(domainMax) || domainMax <= domainMin) {
    throw new RangeError('AreaChart max must be greater than min.');
  }

  const line = sampleSeries(values, width, { strategy: 'max' })
    .map(
      (value) =>
        AREA[Math.round(normalizeValue(value, { max: domainMax, min: domainMin }) * 7)] ?? '#',
    )
    .join('');

  return renderPlainLines([line], { height });
}
