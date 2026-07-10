import { renderPlainLines } from '@/components/shared/text.js';
import { normalizeValue } from '@/core/scale.js';

/** Options accepted by {@link renderHeatmap}. */
export interface RenderHeatmapOptions {
  /** Ordered intensity characters from low to high. */
  characters?: string;

  /** Maximum rendered height. */
  height?: number;

  /** Maximum domain value. Defaults to max cell value or 1. */
  max?: number;

  /** Minimum domain value. Defaults to min cell value or 0. */
  min?: number;

  /** Matrix values in row order. */
  values: readonly (readonly number[])[];

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders a numeric matrix as terminal intensity cells. */
export function renderHeatmap({
  characters = ' .:-=+*#%@',
  height,
  max,
  min,
  values,
  width,
}: RenderHeatmapOptions): string {
  const flat = values.flatMap((row) => [...row]);
  const domainMin = min ?? Math.min(0, ...flat);
  const domainMax = max ?? Math.max(1, ...flat);

  if (!Number.isFinite(domainMin) || !Number.isFinite(domainMax) || domainMax <= domainMin) {
    throw new RangeError('Heatmap max must be greater than min.');
  }

  if (characters.length < 2) {
    throw new RangeError('Heatmap characters must include at least two cells.');
  }

  const lines = values.map((row) =>
    row
      .map((value) => {
        if (!Number.isFinite(value)) {
          throw new RangeError('Heatmap values must be finite.');
        }

        const index = Math.round(
          normalizeValue(value, { max: domainMax, min: domainMin }) * (characters.length - 1),
        );

        return characters[index] ?? characters.at(-1) ?? '@';
      })
      .join(''),
  );

  return renderPlainLines(lines, { height, width });
}
