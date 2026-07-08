import { formatNumber } from '@/core/format.js';
import { truncateText } from '@/core/truncate.js';

/** Tick produced by {@link createAxisTicks}. */
export interface AxisTick {
  label: string;
  position: number;
  value: number;
}

/** Options accepted by {@link renderAxis}. */
export interface RenderAxisOptions {
  /** Character used for the baseline. */
  baseline?: string;

  /** Formats each tick value. */
  formatTick?: (value: number) => string;

  /** Upper domain bound. */
  max: number;

  /** Lower domain bound. */
  min: number;

  /** Character used for tick marks. */
  tick?: string;

  /** Number of ticks including min and max. */
  tickCount?: number;

  /** Width of the rendered axis in terminal cells. */
  width: number;
}

function assertAxis({
  max,
  min,
  tickCount,
  width,
}: Required<Pick<RenderAxisOptions, 'max' | 'min' | 'tickCount' | 'width'>>): void {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    throw new RangeError('Axis max must be greater than min.');
  }

  if (!Number.isInteger(width) || width < 2 || !Number.isInteger(tickCount) || tickCount < 2) {
    throw new RangeError('Axis width and tick count must be valid integers.');
  }
}

/** Creates evenly spaced axis ticks. */
export function createAxisTicks({
  formatTick = (value) => formatNumber(value),
  max,
  min,
  tickCount = 3,
  width,
}: RenderAxisOptions): readonly AxisTick[] {
  assertAxis({ max, min, tickCount, width });

  return Array.from({ length: tickCount }, (_, index) => {
    const ratio = index / (tickCount - 1);
    const value = min + ratio * (max - min);

    return {
      label: formatTick(value),
      position: Math.round(ratio * (width - 1)),
      value,
    };
  });
}

/** Renders a two-line numeric axis with deterministic tick placement. */
export function renderAxis({
  baseline = '─',
  formatTick,
  max,
  min,
  tick = '┬',
  tickCount = 3,
  width,
}: RenderAxisOptions): string {
  const ticks = createAxisTicks({
    ...(formatTick === undefined ? {} : { formatTick }),
    max,
    min,
    tickCount,
    width,
  });
  const axis = Array.from({ length: width }, () => baseline);
  const labels = Array.from({ length: width }, () => ' ');

  for (const item of ticks) {
    axis[item.position] = tick;

    const label = truncateText(item.label, width);
    const start = Math.min(
      width - label.length,
      Math.max(0, item.position - Math.floor(label.length / 2)),
    );

    for (let index = 0; index < label.length; index += 1) {
      labels[start + index] = label[index] ?? ' ';
    }
  }

  return `${axis.join('')}\n${labels.join('').trimEnd()}`;
}
