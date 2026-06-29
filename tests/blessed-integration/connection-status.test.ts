import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { connectionStatus } from '@/adapters/blessed/connection-status.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed ConnectionStatus adapter', () => {
  it('selects ASCII fallback and applies state tone', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        danger: 'red',
        success: 'green',
      },
    });

    try {
      const component = connectionStatus({
        box: { height: 1, width: 24 },
        data: {
          capabilities: { colorLevel: 1, unicode: false },
          latency: 25,
          state: 'online',
          theme,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('+ Online - 25ms');
      expect(component.element.style.fg).toBe('green');

      component.setData({
        capabilities: { colorLevel: 1, unicode: false },
        state: 'offline',
        theme,
      });

      expect(component.element.getContent()).toBe('x Offline');
      expect(component.element.style.fg).toBe('red');
    } finally {
      screen.destroy();
    }
  });
});
