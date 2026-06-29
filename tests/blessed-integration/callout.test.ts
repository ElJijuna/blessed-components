import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { callout } from '@/adapters/blessed/callout.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Callout adapter', () => {
  it('selects ASCII fallback and applies semantic tone', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        success: 'green',
        warning: 'yellow',
      },
    });

    try {
      const component = callout({
        box: { height: 4, width: 18 },
        data: {
          capabilities: { colorLevel: 1, unicode: false },
          content: '{bold}Retry later{/bold}',
          theme,
          tone: 'warning',
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe(
        ['+----------------+', '| ! Retry later  |', '+----------------+'].join('\n'),
      );
      expect(component.element.style.fg).toBe('yellow');

      component.setData({
        capabilities: { colorLevel: 1, unicode: false },
        content: 'Ready',
        theme,
        tone: 'success',
      });

      expect(component.element.getContent()).toBe(
        ['+----------------+', '| + Ready        |', '+----------------+'].join('\n'),
      );
      expect(component.element.style.fg).toBe('green');
    } finally {
      screen.destroy();
    }
  });
});
