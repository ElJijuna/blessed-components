export interface FormatNumberOptions {
  digits?: number;
  locale?: string;
  notation?: Intl.NumberFormatOptions['notation'];
}

export interface FormatPercentOptions {
  digits?: number;
  locale?: string;
}

export interface FormatBytesOptions {
  digits?: number;
  system?: 'iec' | 'si';
}

export interface FormatDurationOptions {
  style?: 'clock' | 'short';
}

export interface FormatRateOptions {
  interval?: string;
  locale?: string;
  unit: string;
}

export interface FormatDateTimeOptions {
  locale?: string;
  timeZone?: string;
}

/** Formats finite numbers with stable defaults. */
export function formatNumber(
  value: number,
  { digits = 1, locale = 'en-US', notation = 'standard' }: FormatNumberOptions = {},
): string {
  if (!Number.isFinite(value)) {
    throw new RangeError('Number must be finite.');
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: digits,
    notation,
  }).format(value);
}

/** Formats a decimal ratio as a percentage. */
export function formatPercent(
  value: number,
  { digits = 0, locale = 'en-US' }: FormatPercentOptions = {},
): string {
  if (!Number.isFinite(value)) {
    throw new RangeError('Percentage must be finite.');
  }

  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
    style: 'percent',
  }).format(value);
}

/** Formats bytes using SI or IEC units. */
export function formatBytes(
  value: number,
  { digits = 1, system = 'iec' }: FormatBytesOptions = {},
): string {
  if (!Number.isFinite(value)) {
    throw new RangeError('Byte value must be finite.');
  }

  const base = system === 'iec' ? 1024 : 1000;
  const units =
    system === 'iec' ? ['B', 'KiB', 'MiB', 'GiB', 'TiB'] : ['B', 'kB', 'MB', 'GB', 'TB'];
  const absolute = Math.abs(value);
  const unitIndex =
    absolute === 0
      ? 0
      : Math.min(Math.floor(Math.log(absolute) / Math.log(base)), units.length - 1);
  const scaled = value / base ** unitIndex;

  return `${Number(scaled.toFixed(digits))} ${units[unitIndex]}`;
}

/** Formats milliseconds as a clock or short duration. */
export function formatDuration(
  milliseconds: number,
  { style = 'short' }: FormatDurationOptions = {},
): string {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    throw new RangeError('Duration must be a non-negative finite number.');
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (style === 'clock') {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return [
    hours > 0 ? `${hours}h` : undefined,
    minutes > 0 ? `${minutes}m` : undefined,
    seconds > 0 || totalSeconds === 0 ? `${seconds}s` : undefined,
  ]
    .filter((part) => part !== undefined)
    .join(' ');
}

/** Formats a numeric rate with a unit and interval. */
export function formatRate(
  value: number,
  { interval = 's', locale = 'en-US', unit }: FormatRateOptions,
): string {
  return `${formatNumber(value, { locale })} ${unit}/${interval}`;
}

/** Formats a date with deterministic terminal-friendly fields. */
export function formatDateTime(
  value: Date | number | string,
  { locale = 'en-US', timeZone }: FormatDateTimeOptions = {},
): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Date value must be valid.');
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...(timeZone === undefined ? {} : { timeZone }),
  }).format(date);
}
