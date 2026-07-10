import { pad, renderPlainLines } from '@/components/shared/text.js';

/** Segment in a stacked bar. */
export interface StackedBarChartSegment {
  /** Segment label. */
  label: string;

  /** Segment value. */
  value: number;
}

/** Row in a stacked bar chart. */
export interface StackedBarChartItem {
  /** Row label. */
  label: string;

  /** Segments in visual order. */
  segments: readonly StackedBarChartSegment[];
}

/** Options accepted by {@link renderStackedBarChart}. */
export interface RenderStackedBarChartOptions {
  /** Segment characters. */
  characters?: readonly string[];

  /** Maximum rendered height. */
  height?: number;

  /** Rows. */
  items: readonly StackedBarChartItem[];

  /** Track width. */
  width: number;
}

/** Renders category composition across multiple segments. */
export function renderStackedBarChart({
  characters = ['#', '=', '-'],
  height,
  items,
  width,
}: RenderStackedBarChartOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('StackedBarChart width must be positive.');
  }

  const labelWidth = Math.max(0, ...items.map((item) => item.label.length));
  const lines = items.map((item) => {
    const total = item.segments.reduce((sum, segment) => sum + segment.value, 0);

    if (!Number.isFinite(total) || total < 0) {
      throw new RangeError('StackedBarChart segment values must be finite and non-negative.');
    }

    const bar = item.segments
      .map((segment, index) => {
        const cells = total === 0 ? 0 : Math.round((segment.value / total) * width);

        return (characters[index % characters.length] ?? '#').repeat(cells);
      })
      .join('')
      .slice(0, width)
      .padEnd(width);

    return `${pad(item.label, labelWidth)} | ${bar} ${total}`;
  });

  return renderPlainLines(lines, { height });
}
