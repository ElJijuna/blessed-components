import { formatNumber } from '@/core/format.js';
import { truncateText } from '@/core/truncate.js';

/** Histogram bin produced by {@link createHistogramBins}. */
export interface HistogramBin {
  count: number;
  end: number;
  start: number;
}

/** Options accepted by {@link renderHistogram}. */
export interface RenderHistogramOptions {
  barWidth: number;
  binCount?: number;
  characters?: {
    empty: string;
    filled: string;
  };
  emptyText?: string;
  formatRange?: (bin: HistogramBin) => string;
  height: number;
  values: readonly number[];
  width: number;
}

/** Groups finite values into equally sized bins. */
export function createHistogramBins(
  values: readonly number[],
  binCount = 5,
): readonly HistogramBin[] {
  if (!Number.isInteger(binCount) || binCount < 1) {
    throw new RangeError('Histogram bin count must be a positive integer.');
  }

  if (values.some((value) => !Number.isFinite(value))) {
    throw new RangeError('Histogram values must be finite.');
  }

  if (values.length === 0) {
    return [];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max === min ? 1 : max - min;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    count: 0,
    end: min + ((index + 1) / binCount) * span,
    start: min + (index / binCount) * span,
  }));

  for (const value of values) {
    const index = Math.min(binCount - 1, Math.floor(((value - min) / span) * binCount));
    const bin = bins[index];

    if (bin === undefined) {
      throw new RangeError('Histogram bin index out of range.');
    }

    bins[index] = { ...bin, count: bin.count + 1 };
  }

  return bins;
}

/** Renders a bounded horizontal histogram. */
export function renderHistogram({
  barWidth,
  binCount = 5,
  characters = { empty: '░', filled: '█' },
  emptyText = 'No values',
  formatRange = ({ end, start }) => `${formatNumber(start)}-${formatNumber(end)}`,
  height,
  values,
  width,
}: RenderHistogramOptions): string {
  if (
    !Number.isInteger(height) ||
    height < 0 ||
    !Number.isInteger(width) ||
    width < 0 ||
    !Number.isInteger(barWidth) ||
    barWidth < 1
  ) {
    throw new RangeError('Histogram dimensions must be valid integers.');
  }

  if (height === 0 || width === 0) {
    return '';
  }

  const bins = createHistogramBins(values, binCount);

  if (bins.length === 0) {
    return truncateText(emptyText, width);
  }

  const maxCount = Math.max(...bins.map(({ count }) => count), 1);

  return bins
    .slice(0, height)
    .map((bin) => {
      const filled = Math.round((bin.count / maxCount) * barWidth);
      const bar = `${characters.filled.repeat(filled)}${characters.empty.repeat(barWidth - filled)}`;

      return truncateText(`${formatRange(bin)} ${bar} ${bin.count}`, width);
    })
    .join('\n');
}
