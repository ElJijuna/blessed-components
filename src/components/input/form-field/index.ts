import { renderLabel } from '@/components/data-display/label/index.js';
import { renderText } from '@/components/data-display/text/index.js';
import { stripBlessedTags } from '@/core/tags.js';
import { stripAnsi } from '@/core/width.js';

/** Character tokens used by {@link renderFormField}. */
export interface FormFieldCharacters {
  /** Marker shown before error text. */
  error: string;

  /** Marker shown before hint text. */
  hint: string;
}

/** Options accepted by {@link renderFormField}. */
export interface RenderFormFieldOptions {
  /** Rendered control content, usually from another component renderer. */
  control: string;

  /** Error text. When present it takes precedence over `hint`. */
  error?: string;

  /** Hint text shown when no error is present. */
  hint?: string;

  /** Form field label. */
  label: string;

  /** Whether the label should include a required indicator. */
  required?: boolean;

  /** Character tokens used for hint and error rows. */
  characters?: FormFieldCharacters;

  /** Maximum rendered height. */
  height?: number;

  /** Maximum terminal-cell width of each line. */
  width: number;
}

const DEFAULT_CHARACTERS: FormFieldCharacters = {
  error: '!',
  hint: '?',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function renderSupportingText({
  characters,
  error,
  hint,
  width,
}: {
  characters: FormFieldCharacters;
  error?: string;
  hint?: string;
  width: number;
}): string | undefined {
  if (error !== undefined) {
    return renderText({
      content: `${characters.error} ${plainText(error)}`,
      height: 1,
      overflow: 'truncate',
      width,
    });
  }

  if (hint !== undefined) {
    return renderText({
      content: `${characters.hint} ${plainText(hint)}`,
      height: 1,
      overflow: 'truncate',
      width,
    });
  }

  return undefined;
}

/**
 * Renders a compact label/control/supporting-text form field.
 *
 * `FormField` composes already-rendered controls. It does not own focus,
 * validation, parsing, or submission state.
 */
export function renderFormField({
  characters = DEFAULT_CHARACTERS,
  control,
  error,
  height,
  hint,
  label,
  required = false,
  width,
}: RenderFormFieldOptions): string {
  if (
    !Number.isInteger(width) ||
    width < 0 ||
    (height !== undefined && (!Number.isInteger(height) || height < 0))
  ) {
    throw new RangeError('FormField dimensions must be non-negative integers.');
  }

  const lines = [
    renderLabel({
      content: label,
      overflow: 'truncate',
      required,
      width,
    }),
    ...renderText({
      content: plainText(control),
      height: 1,
      overflow: 'truncate',
      width,
    }).split('\n'),
  ];
  const supportingText = renderSupportingText({
    characters,
    ...(error === undefined ? {} : { error }),
    ...(hint === undefined ? {} : { hint }),
    width,
  });

  if (supportingText !== undefined) {
    lines.push(supportingText);
  }

  return lines.slice(0, height).join('\n');
}
