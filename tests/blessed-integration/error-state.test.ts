import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { errorState } from '@/adapters/blessed/error-state.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed ErrorState adapter', () => {
  it('creates, updates, styles, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: { danger: 'red', warning: 'yellow' },
    });

    try {
      const component = errorState({
        box: { border: 'line', height: 5, width: 24 },
        data: {
          capabilities: { colorLevel: 1 },
          cause: 'Connection refused',
          message: 'Load failed',
          theme,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('    × Load failed\n\n  Connection refused');
      expect(component.element.style.fg).toBe('red');
      expect(component.element.style.border?.fg).toBe('red');

      component.setData({
        capabilities: { colorLevel: 1 },
        message: 'Degraded',
        showMarker: false,
        theme,
        tone: 'warning',
      });

      expect(component.element.getContent()).toBe('       Degraded');
      expect(component.element.style.fg).toBe('yellow');
      expect(component.element.style.border?.fg).toBe('red');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
