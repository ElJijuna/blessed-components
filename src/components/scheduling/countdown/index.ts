import { renderPlainLines } from '@/components/shared/text.js';

/** Options accepted by {@link renderCountdown}. */
export interface RenderCountdownOptions {
  /** Completion text when remaining time is zero. */
  completeLabel?: string;

  /** Target time. */
  endsAt: Date | number | string;

  /** Maximum rendered height. */
  height?: number;

  /** Optional label. */
  label?: string;

  /** Reference time. */
  now?: Date | number | string;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

function toDate(value: Date | number | string, label: string): Date {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Countdown ${label} must be a valid date.`);
  }

  return date;
}

function clock(milliseconds: number): string {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
    seconds,
  ).padStart(2, '0')}`;
}

/** Renders remaining time until a target date. */
export function renderCountdown({
  completeLabel = 'complete',
  endsAt,
  height,
  label,
  now = Date.now(),
  width,
}: RenderCountdownOptions): string {
  const remaining = Math.max(0, toDate(endsAt, 'endsAt').getTime() - toDate(now, 'now').getTime());
  const value = remaining === 0 ? completeLabel : clock(remaining);
  const line = label === undefined ? value : `${label}: ${value}`;

  return renderPlainLines([line], { height, width });
}
