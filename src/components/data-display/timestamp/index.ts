import { type FormatDateTimeOptions, formatDateTime } from '@/core/format.js';
import { type RenderTextOptions, renderText } from '../text/index.js';

/** Supported timestamp display modes. */
export type TimestampFormat = 'absolute' | 'relative';

/** Options accepted by {@link renderTimestamp}. */
export interface RenderTimestampOptions
  extends Omit<RenderTextOptions, 'content'>,
    FormatDateTimeOptions {
  /**
   * Timestamp display mode.
   *
   * @defaultValue `'absolute'`
   */
  format?: TimestampFormat;

  /**
   * Reference date used by relative timestamps.
   *
   * @defaultValue `Date.now()`
   */
  now?: Date | number | string;

  /** Date-like value to render. */
  value: Date | number | string;
}

const RELATIVE_UNITS = [
  { milliseconds: 365 * 24 * 60 * 60 * 1000, singular: 'year', plural: 'years' },
  { milliseconds: 30 * 24 * 60 * 60 * 1000, singular: 'month', plural: 'months' },
  { milliseconds: 7 * 24 * 60 * 60 * 1000, singular: 'week', plural: 'weeks' },
  { milliseconds: 24 * 60 * 60 * 1000, singular: 'day', plural: 'days' },
  { milliseconds: 60 * 60 * 1000, singular: 'hour', plural: 'hours' },
  { milliseconds: 60 * 1000, singular: 'minute', plural: 'minutes' },
  { milliseconds: 1000, singular: 'second', plural: 'seconds' },
] as const;

function toDate(value: Date | number | string, label: string): Date {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`${label} must be a valid date.`);
  }

  return date;
}

function renderRelativeTimestamp(
  value: Date | number | string,
  now: Date | number | string,
): string {
  const date = toDate(value, 'Timestamp value');
  const referenceDate = toDate(now, 'Timestamp now');
  const delta = date.getTime() - referenceDate.getTime();
  const absoluteDelta = Math.abs(delta);

  if (absoluteDelta < 1000) {
    return 'now';
  }

  const unit = RELATIVE_UNITS.find(({ milliseconds }) => absoluteDelta >= milliseconds);

  if (unit === undefined) {
    return 'now';
  }

  const amount = Math.floor(absoluteDelta / unit.milliseconds);
  const label = amount === 1 ? unit.singular : unit.plural;

  return delta < 0 ? `${amount} ${label} ago` : `in ${amount} ${label}`;
}

/**
 * Renders an absolute or relative timestamp as safe terminal text.
 *
 * This function is framework-independent. Import it from
 * `blessed-components/timestamp` to keep Blessed outside the module graph.
 *
 * @param options - Date value, formatting mode, locale/time zone, and text layout.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown for invalid date values or invalid text dimensions.
 */
export function renderTimestamp({
  format = 'absolute',
  locale,
  now = Date.now(),
  timeZone,
  value,
  ...textOptions
}: RenderTimestampOptions): string {
  const content =
    format === 'relative'
      ? renderRelativeTimestamp(value, now)
      : formatDateTime(value, {
          ...(locale === undefined ? {} : { locale }),
          ...(timeZone === undefined ? {} : { timeZone }),
        });

  return renderText({
    ...textOptions,
    content,
  });
}
