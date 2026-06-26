import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { status } from '@/adapters/blessed/status.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Status adapter', () => {
  it('creates, updates, styles, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: { danger: 'red', success: 'green' },
    });

    try {
      const component = status({
        box: { height: 1, width: 30 },
        data: {
          capabilities: { colorLevel: 1, unicode: false },
          detail: 'retrying',
          label: 'Offline',
          theme,
          tone: 'danger',
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('x Offline - retrying');
      expect(component.element.style.fg).toBe('red');

      component.setData({
        capabilities: { colorLevel: 1, unicode: true },
        label: 'Healthy',
        theme,
        tone: 'success',
      });

      expect(component.element.getContent()).toBe('✓ Healthy');
      expect(component.element.style.fg).toBe('green');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
