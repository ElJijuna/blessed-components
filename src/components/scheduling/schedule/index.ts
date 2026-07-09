import { renderPlainLines } from '@/components/shared/text.js';

/** Schedule event item. */
export interface ScheduleItem {
  /** Event id. */
  id: string;

  /** Event label. */
  label: string;

  /** Optional status text. */
  status?: string;

  /** Start time. */
  time: Date | number | string;
}

/** Options accepted by {@link renderSchedule}. */
export interface RenderScheduleOptions {
  /** Empty-state text. */
  emptyLabel?: string;

  /** Maximum rendered height. */
  height?: number;

  /** Events to render. */
  items: readonly ScheduleItem[];

  /** Locale for time formatting. */
  locale?: string;

  /** IANA time zone used for time labels. */
  timeZone?: string;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

function formatTime(value: Date | number | string, locale?: string, timeZone?: string): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Schedule item time must be a valid date.');
  }

  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    ...(timeZone === undefined ? {} : { timeZone }),
  }).format(date);
}

/** Renders an ordered list of upcoming events. */
export function renderSchedule({
  emptyLabel = 'No upcoming events',
  height,
  items,
  locale,
  timeZone,
  width,
}: RenderScheduleOptions): string {
  const ordered = [...items].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );
  const lines =
    ordered.length === 0
      ? [emptyLabel]
      : ordered.map((item) => {
          const status = item.status === undefined ? '' : ` - ${item.status}`;

          return `${formatTime(item.time, locale, timeZone)} ${item.label}${status}`;
        });

  return renderPlainLines(lines, { height, width });
}
