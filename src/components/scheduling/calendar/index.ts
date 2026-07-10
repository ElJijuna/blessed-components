import { renderPlainLines } from '@/components/shared/text.js';

/** Options accepted by {@link renderCalendar}. */
export interface RenderCalendarOptions {
  /** Month number, 1-12. */
  month: number;

  /** Selected ISO date. */
  selectedDate?: string;

  /** Calendar year. */
  year: number;
}

/** Renders a simple month calendar. */
export function renderCalendar({ month, selectedDate, year }: RenderCalendarOptions): string {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('Calendar year must be integer and month must be 1-12.');
  }

  const first = new Date(Date.UTC(year, month - 1, 1));
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = Array.from({ length: first.getUTCDay() }, () => '  ');

  for (let day = 1; day <= days; day += 1) {
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    cells.push(iso === selectedDate ? `[${day}]` : String(day).padStart(2, ' '));
  }

  const rows = [];

  for (let index = 0; index < cells.length; index += 7) {
    rows.push(cells.slice(index, index + 7).join(' '));
  }

  return renderPlainLines([
    `${year}-${String(month).padStart(2, '0')}`,
    'Su Mo Tu We Th Fr Sa',
    ...rows,
  ]);
}
