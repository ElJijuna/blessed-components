import { type FormFieldCharacters, renderFormField } from '@/components/input/form-field/index.js';
import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Character tokens used by {@link renderPasswordField}. */
export interface PasswordFieldCharacters extends FormFieldCharacters {
  /** Character shown when the current value is empty and no placeholder exists. */
  empty: string;

  /** Marker shown before the input value when focused. */
  focused: string;

  /** Character repeated for each hidden password character. */
  mask: string;

  /** Marker shown when the password is visible. */
  reveal: string;
}

/** Options accepted by {@link renderPasswordField}. */
export interface RenderPasswordFieldOptions {
  /** Character tokens used by the field and supporting text. */
  characters?: PasswordFieldCharacters;

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

  /** Whether the current value should be rendered in plain text. */
  reveal?: boolean;

  /** Whether the label should include a required indicator. */
  required?: boolean;

  /** Current password value. */
  value?: string;

  /** Maximum terminal-cell width of each line. */
  width: number;
}

const DEFAULT_CHARACTERS: PasswordFieldCharacters = {
  empty: ' ',
  error: '!',
  focused: '>',
  hint: '?',
  mask: '*',
  reveal: 'show',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function validateSingleLine(name: string, value: string): string {
  const normalized = plainText(value);

  if (/[\r\n]/u.test(normalized)) {
    throw new RangeError(`PasswordField ${name} must fit on one line.`);
  }

  return normalized;
}

function maskValue(value: string, mask: string): string {
  if (value.length === 0) {
    return value;
  }

  const normalizedMask = plainText(mask);

  if (normalizedMask.length === 0 || /[\r\n]/u.test(normalizedMask)) {
    throw new RangeError('PasswordField mask must be a non-empty single-line string.');
  }

  return Array.from(value, () => normalizedMask).join('');
}

/** Renders a labeled, single-line password field with masking and reveal state. */
export function renderPasswordField({
  characters = DEFAULT_CHARACTERS,
  disabled = false,
  error,
  focused = false,
  height,
  hint,
  label,
  placeholder,
  reveal = false,
  required = false,
  value = '',
  width,
}: RenderPasswordFieldOptions): string {
  if (
    !Number.isInteger(width) ||
    width < 0 ||
    (height !== undefined && (!Number.isInteger(height) || height < 0))
  ) {
    throw new RangeError('PasswordField dimensions must be non-negative integers.');
  }

  const normalizedValue = validateSingleLine('value', value);
  const normalizedPlaceholder =
    placeholder === undefined ? undefined : validateSingleLine('placeholder', placeholder);
  const displayValue =
    normalizedValue.length > 0
      ? reveal
        ? normalizedValue
        : maskValue(normalizedValue, characters.mask)
      : (normalizedPlaceholder ?? characters.empty);
  const focusPrefix = focused ? `${characters.focused} ` : '';
  const revealSuffix = reveal && normalizedValue.length > 0 ? ` ${characters.reveal}` : '';
  const disabledSuffix = disabled ? ' (disabled)' : '';
  const control = truncateText(
    `${focusPrefix}${displayValue}${revealSuffix}${disabledSuffix}`,
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
