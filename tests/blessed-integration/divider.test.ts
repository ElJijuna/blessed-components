import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { divider } from '../../src/adapters/blessed/divider.js';
import { createTheme } from '../../src/core/theme.js';

describe('Blessed Divider adapter', () => {
  it('derives length, selects terminal characters, and updates semantic tone', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        muted: 'blue',
        primary: 'cyan',
      },
    });

    try {
      const component = divider({
        box: { height: 1, width: 10 },
        data: {
          capabilities: { colorLevel: 1, unicode: false },
          theme,
          tone: 'muted',
        },
        parent: screen,
      });
      const { element } = component;

      expect(element.getContent()).toBe('----------');
      expect(element.style.fg).toBe('blue');

      component.setData({
        capabilities: { colorLevel: 1, unicode: true },
        label: 'API',
        theme,
        tone: 'primary',
      });

      expect(component.element).toBe(element);
      expect(element.getContent()).toBe('── API ───');
      expect(element.style.fg).toBe('cyan');
    } finally {
      screen.destroy();
    }
  });
});
