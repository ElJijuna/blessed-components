import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { tag } from '@/adapters/blessed/tag.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Tag adapter', () => {
  it('applies primary tone by default and updates safe content', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        info: 'cyan',
        primary: 'magenta',
      },
    });

    try {
      const component = tag({
        box: { height: 1, width: 14 },
        data: {
          capabilities: { colorLevel: 1 },
          removable: true,
          text: '{bold}production{/bold}',
          theme,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('#production ×');
      expect(component.element.style.fg).toBe('magenta');

      component.setData({
        capabilities: { colorLevel: 1 },
        overflow: 'truncate',
        text: 'region:us-east',
        theme,
        tone: 'info',
      });

      expect(component.element.getContent()).toBe('#region:us-ea…');
      expect(component.element.style.fg).toBe('cyan');
    } finally {
      screen.destroy();
    }
  });
});
