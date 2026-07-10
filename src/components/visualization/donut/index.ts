import { renderPlainLines } from '@/components/shared/text.js';

/** Donut segment. */
export interface DonutSegment {
  label: string;
  value: number;
}

/** Options accepted by {@link renderDonut}. */
export interface RenderDonutOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Segments. */
  segments: readonly DonutSegment[];

  /** Total override. */
  total?: number;

  /** Maximum terminal-cell width. */
  width?: number;
}

/** Renders part-to-whole data as text-first donut summary. */
export function renderDonut({ height, segments, total, width }: RenderDonutOptions): string {
  const resolvedTotal = total ?? segments.reduce((sum, segment) => sum + segment.value, 0);

  if (!Number.isFinite(resolvedTotal) || resolvedTotal < 0) {
    throw new RangeError('Donut total must be finite and non-negative.');
  }

  const lines = [
    `total: ${resolvedTotal}`,
    ...segments.map((segment) => {
      const pct = resolvedTotal === 0 ? 0 : Math.round((segment.value / resolvedTotal) * 100);

      return `${segment.label}: ${segment.value} (${pct}%)`;
    }),
  ];

  return renderPlainLines(lines, { height, width });
}
