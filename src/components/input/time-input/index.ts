import { type FormFieldCharacters, renderFormField } from '@/components/input/form-field/index.js';
import { fitPlain, plain } from '@/components/shared/text.js';

/** Result returned by {@link parseTimeInput}. */
export type TimeInputParseResult =
  | { input: string; minutes: number; valid: true }
  | { input: string; reason: 'empty' | 'invalid' | 'below-min' | 'above-max'; valid: false };

/** Options accepted by {@link parseTimeInput}. */
export interface TimeInputParseOptions {
  /** Inclusive maximum time in `HH:mm` format. */
  max?: string;

  /** Inclusive minimum time in `HH:mm` format. */
  min?: string;
}

/** Options accepted by {@link renderTimeInput}. */
export interface RenderTimeInputOptions extends TimeInputParseOptions {
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

  /** Current time text, expected as `HH:mm`. */
  value?: string;

  /** Maximum terminal-cell width of each line. */
  width: number;
}

const DEFAULT_CHARACTERS: FormFieldCharacters = { error: '!', hint: '?' };
const TIME_RE = /^(?<hour>[01]\d|2[0-3]):(?<minute>[0-5]\d)$/u;

function parseMinutes(input: string): number | undefined {
  const match = TIME_RE.exec(input);

  if (match?.groups === undefined) {
    return undefined;
  }

  return Number(match.groups.hour) * 60 + Number(match.groups.minute);
}

/** Parses `HH:mm` text and validates optional inclusive bounds. */
export function parseTimeInput(
  input: string,
  options: TimeInputParseOptions = {},
): TimeInputParseResult {
  const normalized = plain(input).trim();

  if (normalized.length === 0) {
    return { input: normalized, reason: 'empty', valid: false };
  }

  const minutes = parseMinutes(normalized);

  if (minutes === undefined) {
    return { input: normalized, reason: 'invalid', valid: false };
  }

  const min = options.min === undefined ? undefined : parseMinutes(plain(options.min).trim());
  const max = options.max === undefined ? undefined : parseMinutes(plain(options.max).trim());

  if (options.min !== undefined && min === undefined) {
    throw new RangeError('TimeInput min must be HH:mm.');
  }

  if (options.max !== undefined && max === undefined) {
    throw new RangeError('TimeInput max must be HH:mm.');
  }

  if (min !== undefined && minutes < min) {
    return { input: normalized, reason: 'below-min', valid: false };
  }

  if (max !== undefined && minutes > max) {
    return { input: normalized, reason: 'above-max', valid: false };
  }

  return { input: normalized, minutes, valid: true };
}

/** Renders a labeled time input preview with validation-friendly text. */
export function renderTimeInput({
  characters = DEFAULT_CHARACTERS,
  disabled = false,
  error,
  focused = false,
  height,
  hint = 'HH:mm',
  label,
  placeholder = 'HH:mm',
  required = false,
  value = '',
  width,
}: RenderTimeInputOptions): string {
  if (
    !Number.isInteger(width) ||
    width < 0 ||
    (height !== undefined && (!Number.isInteger(height) || height < 0))
  ) {
    throw new RangeError('TimeInput dimensions must be non-negative integers.');
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
