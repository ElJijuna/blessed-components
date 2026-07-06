import { stripBlessedTags } from '@/core/tags.js';
import { stripAnsi } from '@/core/width.js';

/** Visual structures supported by {@link renderIconButton}. */
export type IconButtonVariant = 'bracketed' | 'plain';

/** Options accepted by {@link renderIconButton}. */
export interface RenderIconButtonOptions {
  /** Whether activation is unavailable. */
  disabled?: boolean;

  /** Whether the button currently owns terminal focus. */
  focused?: boolean;

  /** Non-empty, single-line visible icon or glyph. */
  icon: string;

  /** Non-empty, single-line action description. Required for accessible naming. */
  label: string;

  /**
   * Whether to render the text label beside the icon.
   *
   * @defaultValue `false`
   */
  showLabel?: boolean;

  /**
   * Visual structure.
   *
   * @defaultValue `'bracketed'`
   */
  variant?: IconButtonVariant;
}

function normalizeOneLine(value: string, message: string): string {
  const normalized = stripAnsi(stripBlessedTags(value));

  if (normalized.length === 0 || /[\r\n]/u.test(normalized)) {
    throw new RangeError(message);
  }

  return normalized;
}

/**
 * Renders one compact terminal action with required text description.
 *
 * @param options - Icon, label, visual variant, and interaction state.
 * @returns Plain terminal text.
 */
export function renderIconButton({
  disabled = false,
  focused = false,
  icon,
  label,
  showLabel = false,
  variant = 'bracketed',
}: RenderIconButtonOptions): string {
  const normalizedIcon = normalizeOneLine(
    icon,
    'IconButton icon must be non-empty and fit on one line.',
  );
  const normalizedLabel = normalizeOneLine(
    label,
    'IconButton label must be non-empty and fit on one line.',
  );
  const action = showLabel ? `${normalizedIcon} ${normalizedLabel}` : normalizedIcon;
  const content = variant === 'plain' ? action : `[ ${action} ]`;
  const focusPrefix = focused ? '› ' : '';
  const disabledSuffix = disabled ? ` (${normalizedLabel} disabled)` : '';

  return `${focusPrefix}${content}${disabledSuffix}`;
}
