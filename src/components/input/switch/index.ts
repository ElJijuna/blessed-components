import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Character tokens used by {@link renderSwitch}. */
export interface SwitchCharacters {
  /** Marker rendered when disabled. */
  disabled: string;

  /** Marker rendered when switched off. */
  off: string;

  /** Marker rendered when switched on. */
  on: string;
}

/** Options accepted by {@link renderSwitch}. */
export interface RenderSwitchOptions {
  /** Current boolean state. */
  checked?: boolean;

  /** Character tokens for on/off/disabled states. */
  characters?: SwitchCharacters;

  /** Whether focus and toggling are unavailable. */
  disabled?: boolean;

  /** Whether the switch currently owns terminal focus. */
  focused?: boolean;

  /** Non-empty, single-line switch label. */
  label: string;

  /** Text rendered for the off state. @defaultValue `'off'` */
  offText?: string;

  /** Text rendered for the on state. @defaultValue `'on'` */
  onText?: string;

  /** Maximum terminal-cell width of the rendered row. */
  width?: number;
}

const DEFAULT_CHARACTERS: SwitchCharacters = {
  disabled: '×',
  off: '○',
  on: '●',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function assertOneLine(value: string, message: string): void {
  if (value.length === 0 || /[\r\n]/u.test(value)) {
    throw new RangeError(message);
  }
}

/**
 * Renders one terminal switch with non-color focus and disabled cues.
 *
 * Switch is intended for immediate boolean settings. It exposes state with
 * visible markers so the row remains understandable without terminal color.
 */
export function renderSwitch({
  checked = false,
  characters = DEFAULT_CHARACTERS,
  disabled = false,
  focused = false,
  label,
  offText = 'off',
  onText = 'on',
  width,
}: RenderSwitchOptions): string {
  if (width !== undefined && (!Number.isInteger(width) || width < 0)) {
    throw new RangeError('Switch width must be a non-negative integer.');
  }

  const normalizedLabel = plainText(label);
  const normalizedOffText = plainText(offText);
  const normalizedOnText = plainText(onText);

  assertOneLine(normalizedLabel, 'Switch label must be non-empty and fit on one line.');
  assertOneLine(normalizedOffText, 'Switch offText must be non-empty and fit on one line.');
  assertOneLine(normalizedOnText, 'Switch onText must be non-empty and fit on one line.');

  const marker = disabled ? characters.disabled : checked ? characters.on : characters.off;
  const stateText = checked ? normalizedOnText : normalizedOffText;
  const focusPrefix = focused ? '› ' : '';
  const disabledSuffix = disabled ? ' (disabled)' : '';
  const content = `${focusPrefix}${marker} ${normalizedLabel}: ${stateText}${disabledSuffix}`;

  return width === undefined ? content : truncateText(content, width);
}
