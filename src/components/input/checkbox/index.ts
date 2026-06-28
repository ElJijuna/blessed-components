import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Checked state supported by {@link renderCheckbox}. */
export type CheckboxState = boolean | 'indeterminate';

/** Character tokens used by {@link renderCheckbox}. */
export interface CheckboxCharacters {
  /** Marker rendered when checked. */
  checked: string;

  /** Marker rendered when indeterminate. */
  indeterminate: string;

  /** Marker rendered when unchecked. */
  unchecked: string;
}

/** Options accepted by {@link renderCheckbox}. */
export interface RenderCheckboxOptions {
  /** Current checked state. */
  checked?: CheckboxState;

  /** Character tokens for each state. */
  characters?: CheckboxCharacters;

  /** Whether focus and toggling are unavailable. */
  disabled?: boolean;

  /** Whether the checkbox currently owns terminal focus. */
  focused?: boolean;

  /** Non-empty, single-line checkbox label. */
  label: string;

  /** Maximum terminal-cell width of the rendered row. */
  width?: number;
}

const DEFAULT_CHARACTERS: CheckboxCharacters = {
  checked: 'x',
  indeterminate: '-',
  unchecked: ' ',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

/**
 * Renders one terminal checkbox with non-color focus and disabled cues.
 *
 * @param options - Label, state, optional width, and visual tokens.
 * @returns Plain terminal text.
 */
export function renderCheckbox({
  checked = false,
  characters = DEFAULT_CHARACTERS,
  disabled = false,
  focused = false,
  label,
  width,
}: RenderCheckboxOptions): string {
  if (width !== undefined && (!Number.isInteger(width) || width < 0)) {
    throw new RangeError('Checkbox width must be a non-negative integer.');
  }

  const normalizedLabel = plainText(label);

  if (normalizedLabel.length === 0 || /[\r\n]/u.test(normalizedLabel)) {
    throw new RangeError('Checkbox label must be non-empty and fit on one line.');
  }

  const marker =
    checked === 'indeterminate'
      ? characters.indeterminate
      : checked
        ? characters.checked
        : characters.unchecked;
  const focusPrefix = focused ? '› ' : '';
  const disabledSuffix = disabled ? ' (disabled)' : '';
  const content = `${focusPrefix}[${marker}] ${normalizedLabel}${disabledSuffix}`;

  return width === undefined ? content : truncateText(content, width);
}
