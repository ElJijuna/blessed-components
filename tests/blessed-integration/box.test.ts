import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { box } from '@/adapters/blessed/box.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Box adapter', () => {
  it('applies semantic colors while preserving explicit Blessed style overrides', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        background: 'black',
        border: 'cyan',
        foreground: 'white',
      },
    });

    try {
      const component = box({
        box: {
          border: 'line',
          height: 5,
          style: { fg: 'yellow' },
          width: 30,
        },
        data: {
          capabilities: { colorLevel: 1 },
          theme,
        },
        parent: screen,
      });
      const { element } = component;

      expect(element.style.fg).toBe('yellow');
      expect(element.style.bg).toBe('black');
      expect(element.style.border?.fg).toBe('cyan');

      component.setData({
        capabilities: { colorLevel: 0 },
        theme,
      });

      expect(component.element).toBe(element);
      expect(element.style.fg).toBe('yellow');
      expect(element.style.bg).toBeUndefined();
      expect(element.style.border?.fg).toBeUndefined();

      component.destroy();

      expect(screen.children).not.toContain(element);
    } finally {
      screen.destroy();
    }
  });
});
