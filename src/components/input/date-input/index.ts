import { type FormFieldCharacters, renderFormField } from '@/components/input/form-field/index.js';
import { fitPlain, plain } from '@/components/shared/text.js';

/** Result returned by {@link parseDateInput}. */
export type DateInputParseResult =
  | { input: string; valid: true; value: Date }
  | { input: string; reason: 'empty' | 'invalid' | 'below-min' | 'above-max'; valid: false };

/** Options accepted by {@link parseDateInput}. */
export interface DateInputParseOptions {
  /** Inclusive maximum date accepted, formatted as `YYYY-MM-DD` or Date-like. */
  max?: Date | number | string;

  /** Inclusive minimum date accepted, formatted as `YYYY-MM-DD` or Date-like. */
  min?: Date | number | string;
}

/** Options accepted by {@link renderDateInput}. */
export interface RenderDateInputOptions extends DateInputParseOptions {
  /** Character tokens used by the field and supporting text. */
  characters?: FormFieldCharacters;

  /** Whether editing is unavailable. */
  disabled?: boolean;

  /** Error text. When present it takes precedence over `hint`. */
  error?: string;

  /** Whether the input currently owns terminal focus. */
  focused?: boolean;

  /** Maximum rendered height. */
  height?: number;

  /** Hint text shown when no error is present. */
  hint?: string;

  /** Field label. */
  label: string;

  /** Placeholder shown when value is empty. */
  placeholder?: string;

  /** Whether the label should include a required indicator. */
  required?: boolean;

  /** Current date text, expected as `YYYY-MM-DD`. */
  value?: string;

  /** Maximum terminal-cell width of each line. */
  width: number;
}

const DATE_RE = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/u;
const DEFAULT_CHARACTERS: FormFieldCharacters = { error: '!', hint: '?' };

function parseBound(value: Date | number | string, label: string): number {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`DateInput ${label} must be a valid date.`);
  }

  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** Parses `YYYY-MM-DD` text and validates optional inclusive bounds. */
export function parseDateInput(
  input: string,
  options: DateInputParseOptions = {},
): DateInputParseResult {
  const normalized = plain(input).trim();

  if (normalized.length === 0) {
    return { input: normalized, reason: 'empty', valid: false };
  }

  const match = DATE_RE.exec(normalized);

  if (match?.groups === undefined) {
    return { input: normalized, reason: 'invalid', valid: false };
  }

  const year = Number(match.groups.year);
  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return { input: normalized, reason: 'invalid', valid: false };
  }

  if (options.min !== undefined && time < parseBound(options.min, 'min')) {
    return { input: normalized, reason: 'below-min', valid: false };
  }

  if (options.max !== undefined && time > parseBound(options.max, 'max')) {
    return { input: normalized, reason: 'above-max', valid: false };
  }

  return { input: normalized, valid: true, value: date };
}

/** Renders a labeled date input preview with validation-friendly text. */
export function renderDateInput({
  characters = DEFAULT_CHARACTERS,
  disabled = false,
  error,
  focused = false,
  height,
  hint = 'YYYY-MM-DD',
  label,
  placeholder = 'YYYY-MM-DD',
  required = false,
  value = '',
  width,
}: RenderDateInputOptions): string {
  if (
    !Number.isInteger(width) ||
    width < 0 ||
    (height !== undefined && (!Number.isInteger(height) || height < 0))
  ) {
    throw new RangeError('DateInput dimensions must be non-negative integers.');
  }

  const marker = focused ? '> ' : '';
  const suffix = disabled ? ' (disabled)' : '';
  const control = fitPlain(`${marker}${plain(value) || plain(placeholder)}${suffix}`, width);

  return renderFormField({
    characters,
    control,
    ...(error === undefined ? {} : { error }),
    ...(height === undefined ? {} : { height }),
    hint,
    label,
    required,
    width,
  });
}
