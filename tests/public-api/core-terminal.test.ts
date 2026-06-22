import { describe, expect, it } from 'vitest';

import {
  ASCII_CHARACTERS,
  createCharacterSet,
  createTheme,
  detectCapabilities,
  getColorLevel,
  resolveThemeColor,
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
    });

    expect(theme.colors.primary).toBe('magenta');
    expect(theme.components.badge?.danger).toBe('bright-red');
    expect(resolveThemeColor(theme, 'primary', { colorLevel: 3 })).toBe('magenta');
    expect(resolveThemeColor(theme, 'primary', { colorLevel: 0 })).toBeUndefined();
  });
});
