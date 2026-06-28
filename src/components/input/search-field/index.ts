import { type FormFieldCharacters, renderFormField } from '@/components/input/form-field/index.js';
import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Character tokens used by {@link renderSearchField}. */
export interface SearchFieldCharacters extends FormFieldCharacters {
  /** Marker shown after a non-empty query to indicate clearing is available. */
  clear: string;

  /** Character shown when the current query is empty and no placeholder exists. */
  empty: string;

  /** Marker shown before the query when focused. */
  focused: string;

  /** Marker shown before the query or placeholder. */
  search: string;
}

/** Options accepted by {@link renderSearchField}. */
export interface RenderSearchFieldOptions {
  /** Character tokens used by the field and supporting text. */
  characters?: SearchFieldCharacters;

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

  /** Placeholder shown when query is empty. */
  placeholder?: string;

  /** Current query text. */
  query?: string;

  /** Whether the label should include a required indicator. */
  required?: boolean;

  /** Maximum terminal-cell width of each line. */
  width: number;
}

const DEFAULT_CHARACTERS: SearchFieldCharacters = {
  clear: 'x',
  empty: ' ',
  error: '!',
  focused: '›',
  hint: '?',
  search: '/',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function validateSingleLine(name: string, value: string): string {
  const normalized = plainText(value);

  if (/[\r\n]/u.test(normalized)) {
    throw new RangeError(`SearchField ${name} must fit on one line.`);
  }

  return normalized;
}

/** Renders a labeled, single-line search query field with clear affordance. */
export function renderSearchField({
  characters = DEFAULT_CHARACTERS,
  disabled = false,
  error,
  focused = false,
  height,
  hint,
  label,
  placeholder,
  query = '',
  required = false,
  width,
}: RenderSearchFieldOptions): string {
  if (
    !Number.isInteger(width) ||
    width < 0 ||
    (height !== undefined && (!Number.isInteger(height) || height < 0))
  ) {
    throw new RangeError('SearchField dimensions must be non-negative integers.');
  }

  const normalizedQuery = validateSingleLine('query', query);
  const normalizedPlaceholder =
    placeholder === undefined ? undefined : validateSingleLine('placeholder', placeholder);
  const displayQuery =
    normalizedQuery.length > 0 ? normalizedQuery : (normalizedPlaceholder ?? characters.empty);
  const focusPrefix = focused ? `${characters.focused} ` : '';
  const clearSuffix = normalizedQuery.length > 0 ? ` ${characters.clear}` : '';
  const disabledSuffix = disabled ? ' (disabled)' : '';
  const control = truncateText(
    `${focusPrefix}${characters.search} ${displayQuery}${clearSuffix}${disabledSuffix}`,
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
