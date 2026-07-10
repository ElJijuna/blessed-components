import { fitPlain, pad, renderPlainLines } from '@/components/shared/text.js';
import { clamp, scaleValue } from '@/core/scale.js';

/** Bar item rendered by {@link renderBarChart}. */
export interface BarChartItem {
  /** Bar label. */
  label: string;

  /** Numeric value. */
  value: number;
}

/** Options accepted by {@link renderBarChart}. */
export interface RenderBarChartOptions {
  /** Filled bar character. */
  character?: string;

  /** Maximum rendered height. */
  height?: number;

  /** Items in visual order. */
  items: readonly BarChartItem[];

  /** Maximum domain value. Defaults to max item value or 1. */
  max?: number;

  /** Minimum domain value. */
  min?: number;

  /** Width of bar track. */
  width: number;
}

/** Renders categorical values as horizontal terminal bars. */
export function renderBarChart({
  character = '#',
  height,
  items,
  max = Math.max(1, ...items.map((item) => item.value)),
  min = 0,
  width,
}: RenderBarChartOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('BarChart width must be a positive integer.');
  }

  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    throw new RangeError('BarChart max must be greater than min.');
  }

  const labelWidth = Math.max(0, ...items.map((item) => item.label.length));
  const glyph = fitPlain(character, 1) || '#';
  const lines = items.map((item) => {
    if (!Number.isFinite(item.value)) {
      throw new RangeError('BarChart values must be finite.');
    }

    const cells = Math.round(
      scaleValue(clamp(item.value, min, max), {
        domain: { max, min },
        range: { max: width, min: 0 },
      }),
    );

    return `${pad(item.label, labelWidth)} | ${glyph.repeat(cells).padEnd(width)} ${item.value}`;
  });

  return renderPlainLines(lines, { height });
}
