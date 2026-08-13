import { plain } from '@/components/shared/text.js';

/** Common editor/application modes. Custom strings remain supported. */
export type ModeIndicatorMode =
  | 'command'
  | 'insert'
  | 'normal'
  | 'replace'
  | 'visual'
  | (string & {});
/** Delimiters and modifier marker used by ModeIndicator. */
export interface ModeIndicatorCharacters {
  close: string;
  modified: string;
  open: string;
}
export const MODE_INDICATOR_UNICODE_CHARACTERS: Readonly<ModeIndicatorCharacters> = Object.freeze({
  close: ']',
  modified: '●',
  open: '[',
});
export const MODE_INDICATOR_ASCII_CHARACTERS: Readonly<ModeIndicatorCharacters> = Object.freeze({
  close: ']',
  modified: '*',
  open: '[',
});
/** Options accepted by {@link renderModeIndicator}. */
export interface RenderModeIndicatorOptions {
  characters?: ModeIndicatorCharacters;
  detail?: string;
  label?: string;
  mode: ModeIndicatorMode;
  modified?: boolean;
  shortcut?: string;
  uppercase?: boolean;
}

function oneLine(value: string): string {
  return plain(value)
    .replace(/[\r\n]+/gu, ' ')
    .trim();
}

/** Renders a compact, color-independent application mode indicator. */
export function renderModeIndicator({
  characters = MODE_INDICATOR_UNICODE_CHARACTERS,
  detail,
  label,
  mode,
  modified = false,
  shortcut,
  uppercase = true,
}: RenderModeIndicatorOptions): string {
  const safeMode = oneLine(mode);

  if (safeMode.length === 0) {
    throw new RangeError('ModeIndicator mode must be non-empty.');
  }

  const safeLabel = label === undefined ? safeMode : oneLine(label);

  if (safeLabel.length === 0) {
    throw new RangeError('ModeIndicator label must be non-empty.');
  }

  if (
    oneLine(characters.open).length === 0 ||
    oneLine(characters.close).length === 0 ||
    oneLine(characters.modified).length === 0
  ) {
    throw new RangeError('ModeIndicator characters must be non-empty.');
  }

  const text = uppercase ? safeLabel.toLocaleUpperCase() : safeLabel;
  const state = modified ? ` ${oneLine(characters.modified)}` : '';
  const context = detail === undefined || oneLine(detail).length === 0 ? '' : ` ${oneLine(detail)}`;
  const key =
    shortcut === undefined || oneLine(shortcut).length === 0 ? '' : ` (${oneLine(shortcut)})`;

  return `${oneLine(characters.open)}${text}${state}${oneLine(characters.close)}${context}${key}`;
}
