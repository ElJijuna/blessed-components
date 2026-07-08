import { formatDateTime } from '@/core/format.js';
import { truncateText } from '@/core/truncate.js';

export interface RenderClockOptions {
  label?: string;
  locale?: string;
  timeZone?: string;
  value: Date | number | string;
  width: number;
}

/** Renders one formatted local or zoned time row. */
export function renderClock({ label, locale, timeZone, value, width }: RenderClockOptions): string {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('Clock width must be a non-negative integer.');
  }

  if (width === 0) {
    return '';
  }

  const time = formatDateTime(value, {
    ...(locale === undefined ? {} : { locale }),
    ...(timeZone === undefined ? {} : { timeZone }),
  });

  return truncateText(label === undefined ? time : `${label} ${time}`, width);
}
