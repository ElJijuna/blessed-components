export interface CharacterSet {
  border: {
    horizontal: string;
    vertical: string;
  };
  progress: {
    empty: string;
    filled: string;
  };
  sparkline: readonly string[];
  trend: {
    down: string;
    flat: string;
    up: string;
  };
}

export type CharacterMode = 'ascii' | 'unicode';

export type CharacterSetOverrides = {
  border?: Partial<CharacterSet['border']>;
  progress?: Partial<CharacterSet['progress']>;
  sparkline?: readonly string[];
  trend?: Partial<CharacterSet['trend']>;
};

export const UNICODE_CHARACTERS: Readonly<CharacterSet> = Object.freeze({
  border: Object.freeze({ horizontal: '─', vertical: '│' }),
  progress: Object.freeze({ empty: '░', filled: '█' }),
  sparkline: Object.freeze(['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█']),
  trend: Object.freeze({ down: '↓', flat: '→', up: '↑' }),
});

export const ASCII_CHARACTERS: Readonly<CharacterSet> = Object.freeze({
  border: Object.freeze({ horizontal: '-', vertical: '|' }),
  progress: Object.freeze({ empty: '-', filled: '#' }),
  sparkline: Object.freeze(['.', ':', '*', '#']),
  trend: Object.freeze({ down: 'v', flat: '-', up: '^' }),
});

/**
 * Creates a character set from an immutable preset plus local overrides.
 */
export function createCharacterSet(
  mode: CharacterMode,
  overrides: CharacterSetOverrides = {},
): CharacterSet {
  const base = mode === 'unicode' ? UNICODE_CHARACTERS : ASCII_CHARACTERS;

  return {
    border: { ...base.border, ...overrides.border },
    progress: { ...base.progress, ...overrides.progress },
    sparkline: [...(overrides.sparkline ?? base.sparkline)],
    trend: { ...base.trend, ...overrides.trend },
  };
}
