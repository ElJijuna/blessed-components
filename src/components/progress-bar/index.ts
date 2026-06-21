export interface RenderProgressBarOptions {
  characters?: ProgressBarCharacters;
  formatValue?: (context: ProgressBarValueContext) => string;
  label?: string;
  max?: number;
  min?: number;
  value: number;
  width: number;
}

export interface ProgressBarCharacters {
  empty: string;
  filled: string;
}

export interface ProgressBarValueContext {
  percentage: number;
  value: number;
}

export function renderProgressBar({
  characters = { empty: '░', filled: '█' },
  formatValue = ({ percentage }) => `${percentage}%`,
  label,
  max = 100,
  min = 0,
  value,
  width,
}: RenderProgressBarOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('ProgressBar width must be a positive integer.');
  }

  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    throw new RangeError('ProgressBar max must be greater than min.');
  }

  if (!Number.isFinite(value)) {
    throw new RangeError('ProgressBar value must be finite.');
  }

  const clampedValue = Math.min(max, Math.max(min, value));
  const percentage = Math.round(((clampedValue - min) / (max - min)) * 100);
  const filledWidth = Math.round((percentage / 100) * width);
  const track =
    characters.filled.repeat(filledWidth) + characters.empty.repeat(width - filledWidth);
  const prefix = label === undefined ? '' : `${label} `;
  const valueText = formatValue({ percentage, value: clampedValue });

  return `${prefix}${track} ${valueText}`;
}
