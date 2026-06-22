import { stripBlessedTags } from '@/core/tags.js';
import { stripAnsi } from '@/core/width.js';

/** Visual structures supported by {@link renderButton}. */
export type ButtonVariant = 'bracketed' | 'plain';

/** Options accepted by {@link renderButton}. */
export interface RenderButtonOptions {
  /** Whether activation is unavailable. */
  disabled?: boolean;

  /** Whether the button currently owns terminal focus. */
  focused?: boolean;

  /** Non-empty, single-line action name. */
  label: string;

  /**
   * Visual structure.
   *
   * @defaultValue `'bracketed'`
   */
  variant?: ButtonVariant;
}

/**
 * Renders one terminal action with non-color focus and disabled cues.
 *
 * @param options - Label, visual variant, and interaction state.
 * @returns Plain terminal text.
 */
export function renderButton({
  disabled = false,
  focused = false,
  label,
  variant = 'bracketed',
}: RenderButtonOptions): string {
  const normalizedLabel = stripAnsi(stripBlessedTags(label));

  if (normalizedLabel.length === 0 || /[\r\n]/u.test(normalizedLabel)) {
    throw new RangeError('Button label must be non-empty and fit on one line.');
  }

  const content = variant === 'plain' ? normalizedLabel : `[ ${normalizedLabel} ]`;
  const focusPrefix = focused ? '› ' : '';
  const disabledSuffix = disabled ? ' (disabled)' : '';

  return `${focusPrefix}${content}${disabledSuffix}`;
}
