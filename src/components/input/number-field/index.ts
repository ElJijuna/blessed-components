import { type FormFieldCharacters, renderFormField } from '@/components/input/form-field/index.js';
import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Character tokens used by {@link renderNumberField}. */
export interface NumberFieldCharacters extends FormFieldCharacters {
  /** Marker shown for decrement affordance. */
  decrement: string;

  /** Character shown when no value or placeholder exists. */
  empty: string;

  /** Marker shown before the input value when focused. */
  focused: string;

  /** Marker shown for increment affordance. */
  increment: string;
}

/** Options used when parsing numeric text. */
export interface NumberFieldParseOptions {
  /** Inclusive maximum accepted value. */
  max?: number | undefined;

  /** Inclusive minimum accepted value. */
  min?: number | undefined;
}

/** Result returned by {@link parseNumberFieldInput}. */
export type NumberFieldParseResult =
  | { input: string; valid: true; value: number }
  | { input: string; reason: 'empty' | 'invalid' | 'below-min' | 'above-max'; valid: false };

/** Options accepted by {@link renderNumberField}. */
export interface RenderNumberFieldOptions extends NumberFieldParseOptions {
  /** Character tokens used by the field and supporting text. */
  characters?: NumberFieldCharacters;

  /** Whether focus and editing are unavailable. */
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

  /** Whether to show decrement/increment affordances. */
  showStepper?: boolean;

  /** Increment/decrement amount. */
  step?: number | undefined;

  /** Current numeric value. */
  value?: number | undefined;

  /** Maximum terminal-cell width of each line. */
  width: number;
}

const DEFAULT_CHARACTERS: NumberFieldCharacters = {
  decrement: '-',
  empty: ' ',
  error: '!',
  focused: '>',
  hint: '?',
  increment: '+',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function validateSingleLine(name: string, value: string): string {
  const normalized = plainText(value);

  if (/[\r\n]/u.test(normalized)) {
    throw new RangeError(`NumberField ${name} must fit on one line.`);
  }

  return normalized;
}

function validateFinite(name: string, value: number | undefined): void {
  if (value !== undefined && !Number.isFinite(value)) {
    throw new RangeError(`NumberField ${name} must be finite.`);
  }
}

function validateNumberFieldOptions({
  max,
  min,
  step,
}: NumberFieldParseOptions & { step?: number | undefined }): void {
  validateFinite('min', min);
  validateFinite('max', max);
  validateFinite('step', step);

  if (min !== undefined && max !== undefined && min > max) {
    throw new RangeError('NumberField min must be less than or equal to max.');
  }

  if (step !== undefined && step <= 0) {
    throw new RangeError('NumberField step must be greater than zero.');
  }
}

/** Parses a single-line numeric input and validates optional bounds. */
export function parseNumberFieldInput(
  input: string,
  options: NumberFieldParseOptions = {},
): NumberFieldParseResult {
  validateNumberFieldOptions(options);

  const normalized = validateSingleLine('input', input).trim();

  if (normalized.length === 0) {
    return { input: normalized, reason: 'empty', valid: false };
  }

  const value = Number(normalized);

  if (!Number.isFinite(value)) {
    return { input: normalized, reason: 'invalid', valid: false };
  }

  if (options.min !== undefined && value < options.min) {
    return { input: normalized, reason: 'below-min', valid: false };
  }

  if (options.max !== undefined && value > options.max) {
    return { input: normalized, reason: 'above-max', valid: false };
  }

  return { input: normalized, valid: true, value };
}

/** Clamps a finite number to optional inclusive bounds. */
export function clampNumberFieldValue(
  value: number,
  options: NumberFieldParseOptions = {},
): number {
  validateNumberFieldOptions(options);
  validateFinite('value', value);

  return Math.min(options.max ?? value, Math.max(options.min ?? value, value));
}

/** Renders a labeled, single-line numeric field with bounds and step affordances. */
export function renderNumberField({
  characters = DEFAULT_CHARACTERS,
  disabled = false,
  error,
  focused = false,
  height,
  hint,
  label,
  max,
  min,
  placeholder,
  required = false,
  showStepper = true,
  step = 1,
  value,
  width,
}: RenderNumberFieldOptions): string {
  if (
    !Number.isInteger(width) ||
    width < 0 ||
    (height !== undefined && (!Number.isInteger(height) || height < 0))
  ) {
    throw new RangeError('NumberField dimensions must be non-negative integers.');
  }

  validateNumberFieldOptions({ max, min, step });
  validateFinite('value', value);

  if (value !== undefined) {
    clampNumberFieldValue(value, { max, min });
  }

  const normalizedPlaceholder =
    placeholder === undefined ? undefined : validateSingleLine('placeholder', placeholder);
  const displayValue =
    value === undefined ? (normalizedPlaceholder ?? characters.empty) : String(value);
  const focusPrefix = focused ? `${characters.focused} ` : '';
  const stepperSuffix =
    showStepper && !disabled ? ` ${characters.decrement}/${characters.increment}` : '';
  const disabledSuffix = disabled ? ' (disabled)' : '';
  const control = truncateText(
    `${focusPrefix}${displayValue}${stepperSuffix}${disabledSuffix}`,
    width,
  );

  return renderFormField({
    characters,
    control,
    ...(error === undefined ? {} : { error }),
    ...(height === undefined ? {} : { height }),
    ...(hint === undefined ? {} : { hint }),
    label,
    required,
    width,
  });
}
