import { pad, renderPlainLines } from '@/components/shared/text.js';

/** Waterfall step. */
export interface WaterfallChartStep {
  label: string;
  value: number;
}

/** Options accepted by {@link renderWaterfallChart}. */
export interface RenderWaterfallChartOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Initial value. */
  start?: number;

  /** Steps in order. */
  steps: readonly WaterfallChartStep[];

  /** Maximum terminal-cell width. */
  width?: number;
}

/** Renders sequential positive and negative contributions. */
export function renderWaterfallChart({
  height,
  start = 0,
  steps,
  width,
}: RenderWaterfallChartOptions): string {
  if (!Number.isFinite(start)) {
    throw new RangeError('WaterfallChart start must be finite.');
  }

  let total = start;

  const labelWidth = Math.max('start'.length, ...steps.map((step) => step.label.length));
  const lines = [`${pad('start', labelWidth)} ${start}`];

  for (const step of steps) {
    if (!Number.isFinite(step.value)) {
      throw new RangeError('WaterfallChart step values must be finite.');
    }

    total += step.value;
    lines.push(
      `${pad(step.label, labelWidth)} ${step.value >= 0 ? '+' : ''}${step.value} -> ${total}`,
    );
  }

  return renderPlainLines(lines, { height, width });
}
