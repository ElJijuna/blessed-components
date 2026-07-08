import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Character tokens used by {@link renderKeybindingInput}. */
export interface KeybindingInputCharacters {
  idle: string;
  recording: string;
  separator: string;
}

/** Options accepted by {@link renderKeybindingInput}. */
export interface RenderKeybindingInputOptions {
  characters?: KeybindingInputCharacters;
  keys?: readonly string[];
  placeholder?: string;
  recording?: boolean;
  width: number;
}

const DEFAULT_CHARACTERS: KeybindingInputCharacters = {
  idle: '○',
  recording: '●',
  separator: '+',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value)).trim();
}

/** Normalizes one Blessed key name into display text. */
export function formatKeybindingPart(value: string): string {
  const safeValue = plainText(value);

  if (safeValue.length === 0 || /[\r\n]/u.test(safeValue)) {
    throw new RangeError('Keybinding parts must be non-empty one-line strings.');
  }

  return safeValue
    .split('-')
    .map((part) =>
      part.length === 1 ? part.toUpperCase() : `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`,
    )
    .join('+');
}

/** Renders captured shortcut state as one compact input row. */
export function renderKeybindingInput({
  characters = DEFAULT_CHARACTERS,
  keys = [],
  placeholder = 'Press shortcut',
  recording = false,
  width,
}: RenderKeybindingInputOptions): string {
  if (!Number.isInteger(width) || width < 0) {
    throw new RangeError('KeybindingInput width must be a non-negative integer.');
  }

  if (width === 0) {
    return '';
  }

  const content =
    keys.length === 0
      ? plainText(placeholder)
      : keys.map(formatKeybindingPart).join(` ${characters.separator} `);
  const marker = recording ? characters.recording : characters.idle;

  return truncateText(`${marker} ${content}`, width);
}
