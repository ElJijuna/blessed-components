import { type FormFieldCharacters, renderFormField } from '@/components/input/form-field/index.js';
import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Character tokens used by {@link renderTextField}. */
export interface TextFieldCharacters extends FormFieldCharacters {
  /** Marker shown before the input value when focused. */
  focused: string;

  /** Character shown when the current value is empty and no placeholder exists. */
  empty: string;
}

/** Options accepted by {@link renderTextField}. */
export interface RenderTextFieldOptions {
  /** Character tokens used by the field and supporting text. */
  characters?: TextFieldCharacters;

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

  /** Current text value. */
  value?: string;

  /** Maximum terminal-cell width of each line. */
  width: number;
}

const DEFAULT_CHARACTERS: TextFieldCharacters = {
  empty: ' ',
  error: '!',
  focused: '›',
  hint: '?',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function validateSingleLine(name: string, value: string): string {
  const normalized = plainText(value);

  if (/[\r\n]/u.test(normalized)) {
    throw new RangeError(`TextField ${name} must fit on one line.`);
  }

  return normalized;
}

/**
 * Renders a labeled, single-line text field with hint or error support.
 *
 * The pure renderer is display-only. Editing, cursor behavior, and submit
 * handling live in adapters such as the Blessed `textField` adapter.
 */
export function renderTextField({
  characters = DEFAULT_CHARACTERS,
  disabled = false,
  error,
  focused = false,
  height,
  hint,
  label,
  placeholder,
  required = false,
  value = '',
  width,
}: RenderTextFieldOptions): string {
  if (
    !Number.isInteger(width) ||
    width < 0 ||
    (height !== undefined && (!Number.isInteger(height) || height < 0))
  ) {
    throw new RangeError('TextField dimensions must be non-negative integers.');
  }

  const normalizedValue = validateSingleLine('value', value);
  const normalizedPlaceholder =
    placeholder === undefined ? undefined : validateSingleLine('placeholder', placeholder);
  const displayValue =
    normalizedValue.length > 0 ? normalizedValue : (normalizedPlaceholder ?? characters.empty);
  const focusPrefix = focused ? `${characters.focused} ` : '';
  const disabledSuffix = disabled ? ' (disabled)' : '';
  const control = truncateText(`${focusPrefix}${displayValue}${disabledSuffix}`, width);

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
