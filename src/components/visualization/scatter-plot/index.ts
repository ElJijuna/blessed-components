import { renderPlainLines } from '@/components/shared/text.js';
import { normalizeValue } from '@/core/scale.js';

/** Scatter point. */
export interface ScatterPlotPoint {
  /** Optional point label. */
  label?: string;

  /** X value. */
  x: number;

  /** Y value. */
  y: number;
}

/** Options accepted by {@link renderScatterPlot}. */
export interface RenderScatterPlotOptions {
  /** Plot height. */
  height: number;

  /** Points. */
  points: readonly ScatterPlotPoint[];

  /** Plot width. */
  width: number;

  /** X domain. */
  xDomain?: { max: number; min: number };

  /** Y domain. */
  yDomain?: { max: number; min: number };
}

/** Renders points on a fixed terminal grid. */
export function renderScatterPlot({
  height,
  points,
  width,
  xDomain,
  yDomain,
}: RenderScatterPlotOptions): string {
  if (!Number.isInteger(width) || width < 1 || !Number.isInteger(height) || height < 1) {
    throw new RangeError('ScatterPlot dimensions must be positive.');
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const xd = xDomain ?? { max: Math.max(1, ...xs), min: Math.min(0, ...xs) };
  const yd = yDomain ?? { max: Math.max(1, ...ys), min: Math.min(0, ...ys) };
  const grid = Array.from({ length: height }, () => Array.from({ length: width }, () => ' '));

  for (const point of points) {
    const x = Math.round(normalizeValue(point.x, xd) * (width - 1));
    const y = height - 1 - Math.round(normalizeValue(point.y, yd) * (height - 1));
    const row = grid[y];

    if (row !== undefined) {
      row[x] = '*';
    }
  }

  return renderPlainLines(grid.map((row) => row.join('')));
}
