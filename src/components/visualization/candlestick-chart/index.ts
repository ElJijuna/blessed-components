import { renderPlainLines } from '@/components/shared/text.js';

/** OHLC candle. */
export interface CandlestickPoint {
  close: number;
  high: number;
  label: string;
  low: number;
  open: number;
}

/** Options accepted by {@link renderCandlestickChart}. */
export interface RenderCandlestickChartOptions {
  /** Maximum rendered height. */
  height?: number;

  /** OHLC points. */
  points: readonly CandlestickPoint[];

  /** Maximum terminal-cell width. */
  width?: number;
}

/** Renders OHLC rows with direction. */
export function renderCandlestickChart({
  height,
  points,
  width,
}: RenderCandlestickChartOptions): string {
  const lines = points.map((point) => {
    if (
      ![point.open, point.high, point.low, point.close].every(Number.isFinite) ||
      point.low > point.high
    ) {
      throw new RangeError('Candlestick values must be finite and low <= high.');
    }

    const direction = point.close >= point.open ? 'up' : 'down';

    return `${point.label}: O ${point.open} H ${point.high} L ${point.low} C ${point.close} ${direction}`;
  });

  return renderPlainLines(lines, { height, width });
}
