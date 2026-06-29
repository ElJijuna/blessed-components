import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { timestamp } from '@/adapters/blessed/timestamp.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Timestamp adapter', () => {
  it('applies muted tone by default and updates formatted content', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        info: 'cyan',
        muted: 'blue',
      },
    });

    try {
      const component = timestamp({
        box: { height: 1, width: 16 },
        data: {
          capabilities: { colorLevel: 1 },
          format: 'relative',
          now: '2026-06-29T16:00:00Z',
          theme,
          value: '2026-06-29T15:30:00Z',
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('30 minutes ago');
      expect(component.element.style.fg).toBe('blue');

      component.setData({
        capabilities: { colorLevel: 1 },
        format: 'relative',
        now: '2026-06-29T16:00:00Z',
        overflow: 'truncate',
        theme,
        tone: 'info',
        value: '2026-06-29T18:00:00Z',
      });

      expect(component.element.getContent()).toBe('in 2 hours');
      expect(component.element.style.fg).toBe('cyan');
    } finally {
      screen.destroy();
    }
  });
});
