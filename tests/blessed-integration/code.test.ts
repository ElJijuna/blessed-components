import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { code } from '@/adapters/blessed/code.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Code adapter', () => {
  it('renders, updates, resizes, themes, and destroys inline code', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        foreground: 'white',
        muted: 'grey',
      },
    });

    try {
      const component = code({
        box: { height: 1, width: 16 },
        data: {
          capabilities: { colorLevel: 1 },
          content: 'npm run build',
          theme,
          tone: 'muted',
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('`npm run build`');
      expect(component.element.style.fg).toBe('grey');

      component.setData({
        content: 'blessed-components',
        overflow: 'clip',
        variant: 'plain',
      });

      expect(component.element.getContent()).toBe('blessed-componen');

      component.element.width = 8;
      component.element.emit('resize');

      expect(component.element.getContent()).toBe('blessed-');

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
