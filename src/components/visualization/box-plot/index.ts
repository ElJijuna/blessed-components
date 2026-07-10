import { renderPlainLines } from '@/components/shared/text.js';
import { normalizeValue } from '@/core/scale.js';

/** Box plot summary. */
export interface BoxPlotSummary {
  label: string;
  lowerQuartile: number;
  max: number;
  median: number;
  min: number;
  upperQuartile: number;
}

/** Options accepted by {@link renderBoxPlot}. */
export interface RenderBoxPlotOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Summary rows. */
  items: readonly BoxPlotSummary[];

  /** Track width. */
  width: number;
}

/** Renders statistical distribution summaries. */
export function renderBoxPlot({ height, items, width }: RenderBoxPlotOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('BoxPlot width must be positive.');
  }

  const lines = items.map((item) => {
    if (
      !(
        item.min <= item.lowerQuartile &&
        item.lowerQuartile <= item.median &&
        item.median <= item.upperQuartile &&
        item.upperQuartile <= item.max
      )
    ) {
      throw new RangeError('BoxPlot summary values must be ordered.');
    }

    const track = Array.from({ length: width }, () => ' ');
    const pos = (value: number) =>
      Math.round(normalizeValue(value, { max: item.max, min: item.min }) * (width - 1));

    for (let index = pos(item.lowerQuartile); index <= pos(item.upperQuartile); index += 1) {
      track[index] = '=';
    }

    track[pos(item.min)] = '|';
    track[pos(item.max)] = '|';
    track[pos(item.median)] = '*';

    return `${item.label} [${track.join('')}]`;
  });

  return renderPlainLines(lines, { height });
}
