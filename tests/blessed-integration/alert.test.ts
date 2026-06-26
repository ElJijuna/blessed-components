import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { alert } from '@/adapters/blessed/alert.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Alert adapter', () => {
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
      const component = alert({
        box: { border: 'line', height: 4, width: 24 },
        data: {
          capabilities: { colorLevel: 1, unicode: false },
          description: 'retrying',
          theme,
          title: 'Deploy failed',
          tone: 'danger',
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('x Deploy failed\n  retrying');
      expect(component.element.style.fg).toBe('red');
      expect(component.element.style.border?.fg).toBe('red');

      component.setData({
        capabilities: { colorLevel: 1, unicode: true },
        description: 'All checks passed',
        theme,
        tone: 'success',
      });

      expect(component.element.getContent()).toBe('✓ All checks passed');
      expect(component.element.style.fg).toBe('green');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
