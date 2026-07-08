import { formatDuration } from '@/core/format.js';
import { truncateText } from '@/core/truncate.js';

export interface RenderTimerOptions {
  elapsed: number;
  label?: string;
  paused?: boolean;
  width: number;
}

/** Renders elapsed duration with optional paused state. */
export function renderTimer({ elapsed, label, paused = false, width }: RenderTimerOptions): string {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('Timer width must be a non-negative integer.');
  }

  if (width === 0) {
    return '';
  }

  const duration = formatDuration(elapsed);
  const state = paused ? ' paused' : '';

  return truncateText(
    label === undefined ? `${duration}${state}` : `${label} ${duration}${state}`,
    width,
  );
}
