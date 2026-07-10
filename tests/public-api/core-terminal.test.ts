import { describe, expect, it } from 'vitest';

import {
  ASCII_CHARACTERS,
  createCapabilityMatrix,
  createCharacterSet,
  createTheme,
  detectCapabilities,
  getColorLevel,
  resolveComponentThemeColor,
  resolveThemeColor,
  selectCapabilityProfile,
  UNICODE_CHARACTERS,
} from '@/core/index.js';

describe('core terminal policy', () => {
  it('detects color, Unicode, and mouse capabilities from explicit environment data', () => {
    expect(
      detectCapabilities({
        env: { COLORTERM: 'truecolor', TERM: 'xterm-256color' },
        isTTY: true,
        platform: 'linux',
      }),
    ).toEqual({
      colorLevel: 3,
      mouse: true,
      unicode: true,
    });
  });

  it('honors NO_COLOR and non-TTY output', () => {
    expect(
      detectCapabilities({
        env: { NO_COLOR: '1', TERM: 'dumb' },
        isTTY: false,
        platform: 'win32',
      }),
    ).toEqual({
      colorLevel: 0,
      mouse: false,
      unicode: false,
    });
    expect(getColorLevel({ env: { NO_COLOR: '1' }, isTTY: true })).toBe(0);
  });

  it('provides immutable Unicode and ASCII character presets with overrides', () => {
    expect(UNICODE_CHARACTERS.progress.filled).toBe('█');
    expect(ASCII_CHARACTERS.progress.filled).toBe('#');
    expect(createCharacterSet('ascii', { progress: { filled: '=' } }).progress).toEqual({
      empty: '-',
      filled: '=',
    });
  });

  it('creates semantic themes and resolves colors according to capability', () => {
    const theme = createTheme({
      colors: { primary: 'magenta' },
      components: { badge: { danger: 'bright-red' } },
      density: 'spacious',
      highContrast: true,
      variants: {
        selected: {
          borders: { focus: 'yellow' },
          colors: { primary: 'bright-blue' },
          spacing: { paddingX: 2 },
        },
      },
    });

    expect(theme.colors.primary).toBe('magenta');
    expect(theme.colors.foreground).toBe('bright-white');
    expect(theme.density).toBe('spacious');
    expect(theme.spacing).toEqual({ gap: 2, itemGap: 1, paddingX: 2, paddingY: 1 });
    expect(theme.borders).toMatchObject({ focus: 'cyan', radius: 0, style: 'single' });
    expect(theme.components.badge?.danger).toBe('bright-red');
    expect(theme.variants.selected?.colors?.primary).toBe('bright-blue');
    expect(resolveThemeColor(theme, 'primary', { colorLevel: 3 })).toBe('magenta');
    expect(resolveThemeColor(theme, 'primary', { colorLevel: 0 })).toBeUndefined();
    expect(resolveComponentThemeColor(theme, 'badge', 'danger', { colorLevel: 3 })).toBe(
      'bright-red',
    );
    expect(resolveComponentThemeColor(theme, 'badge', 'primary', { colorLevel: 3 })).toBe(
      'magenta',
    );
    expect(resolveComponentThemeColor(theme, 'badge', 'danger', { colorLevel: 0 })).toBeUndefined();
  });

  it('builds a deterministic terminal capability matrix', () => {
    const matrix = createCapabilityMatrix();

    expect(matrix.map((entry) => entry.scenario.id)).toEqual([
      'dumb',
      'no-color',
      'windows-ascii',
      'xterm-256',
      'truecolor',
    ]);
    expect(matrix.map((entry) => [entry.characterMode, entry.profile])).toEqual([
      ['ascii', 'dumb'],
      ['unicode', 'basic'],
      ['ascii', 'ascii'],
      ['unicode', 'rich'],
      ['unicode', 'rich'],
    ]);
    expect(selectCapabilityProfile({ colorLevel: 1, mouse: true, unicode: true })).toBe('basic');
  });
});
