import { stripBlessedTags } from '@/core/tags.js';
import { stripAnsi } from '@/core/width.js';
import { type RenderTextOptions, renderText, type TextAlign } from '../text/index.js';

/** Visual structures supported by {@link renderKbd}. */
export type KbdVariant = 'bracketed' | 'plain';

/** Single-line overflow policies supported by {@link renderKbd}. */
export type KbdOverflow = 'clip' | 'truncate';

/** Options accepted by {@link renderKbd}. */
export interface RenderKbdOptions
  extends Omit<RenderTextOptions, 'content' | 'height' | 'overflow' | 'verticalAlign'> {
  /** Horizontal alignment applied after overflow handling. @defaultValue `'left'` */
  align?: TextAlign;

  /**
   * Separator inserted between keys in one chord.
   *
   * @defaultValue `+`
   */
  keySeparator?: string;

  /**
   * Keyboard chord or ordered shortcut alternatives.
   *
   * Chords may use `-` or `+` separators, such as `C-s`, `M-enter`, or
   * `Ctrl+Shift+P`.
   */
  keys: string | readonly string[];

  /**
   * Whether common terminal modifiers should be expanded to readable names.
   *
   * @defaultValue `true`
   */
  normalize?: boolean;

  /**
   * Single-line overflow policy.
   *
   * @defaultValue `'truncate'`
   */
  overflow?: KbdOverflow;

  /**
   * Separator inserted between shortcut alternatives.
   *
   * @defaultValue `' / '`
   */
  shortcutSeparator?: string;

  /**
   * Visual structure used for each key.
   *
   * @defaultValue `'bracketed'`
   */
  variant?: KbdVariant;
}

const MODIFIER_LABELS = new Map<string, string>([
  ['c', 'Ctrl'],
  ['ctrl', 'Ctrl'],
  ['control', 'Ctrl'],
  ['m', 'Alt'],
  ['meta', 'Alt'],
  ['alt', 'Alt'],
  ['s', 'Shift'],
  ['shift', 'Shift'],
]);
const KEY_LABELS = new Map<string, string>([
  ['backspace', 'Backspace'],
  ['delete', 'Delete'],
  ['down', 'Down'],
  ['enter', 'Enter'],
  ['escape', 'Esc'],
  ['esc', 'Esc'],
  ['left', 'Left'],
  ['return', 'Enter'],
  ['right', 'Right'],
  ['space', 'Space'],
  ['tab', 'Tab'],
  ['up', 'Up'],
]);

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function normalizeKey(value: string, normalize: boolean, modifierPosition: boolean): string {
  const safeKey = plainText(value).trim();

  if (safeKey.length === 0 || /[\r\n]/u.test(safeKey)) {
    throw new RangeError('Kbd keys must be non-empty and fit on one line.');
  }

  if (!normalize) {
    return safeKey;
  }

  const lookup = safeKey.toLowerCase();
  const modifier = modifierPosition ? MODIFIER_LABELS.get(lookup) : undefined;

  if (modifier !== undefined) {
    return modifier;
  }

  return KEY_LABELS.get(lookup) ?? (safeKey.length === 1 ? safeKey.toUpperCase() : safeKey);
}

function splitChord(chord: string): string[] {
  return plainText(chord)
    .split(/[+-]/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/**
 * Renders one or more keyboard shortcuts as safe one-line terminal text.
 *
 * This function is framework-independent. Import it from
 * `blessed-components/kbd` to keep Blessed outside the module graph.
 *
 * @param options - Keys, separators, variant, normalization, and layout.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown when a key, separator, or shortcut is empty or multiline, or when
 * configured text dimensions are invalid.
 */
export function renderKbd({
  keySeparator = '+',
  keys,
  normalize = true,
  overflow = 'truncate',
  shortcutSeparator = ' / ',
  variant = 'bracketed',
  ...textOptions
}: RenderKbdOptions): string {
  const normalizedKeySeparator = plainText(keySeparator);
  const normalizedShortcutSeparator = plainText(shortcutSeparator);

  if (
    normalizedKeySeparator.length === 0 ||
    /[\r\n]/u.test(normalizedKeySeparator) ||
    /[\r\n]/u.test(normalizedShortcutSeparator)
  ) {
    throw new RangeError('Kbd separators must be single-line text.');
  }

  const shortcuts = (typeof keys === 'string' ? [keys] : [...keys]).map((shortcut) => {
    const parts = splitChord(shortcut);

    if (parts.length === 0) {
      throw new RangeError('Kbd shortcuts must include at least one key.');
    }

    return parts
      .map((part, index) => {
        const key = normalizeKey(part, normalize, index < parts.length - 1);

        return variant === 'bracketed' ? `[${key}]` : key;
      })
      .join(normalizedKeySeparator);
  });

  return renderText({
    ...textOptions,
    content: shortcuts.join(normalizedShortcutSeparator),
    height: 1,
    overflow,
  });
}
