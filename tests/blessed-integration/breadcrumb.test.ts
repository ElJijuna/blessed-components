import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { breadcrumb } from '@/adapters/blessed/breadcrumb.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Breadcrumb adapter', () => {
  it('applies muted tone by default and updates safe content', () => {
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
      const component = breadcrumb({
        box: { height: 1, width: 16 },
        data: {
          capabilities: { colorLevel: 1 },
          items: [
            { label: '{bold}Home{/bold}' },
            { label: 'Projects' },
            { label: 'blessed-components' },
            { label: 'Roadmap' },
          ],
          theme,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('Home / … / Road…');
      expect(component.element.style.fg).toBe('blue');

      component.setData({
        capabilities: { colorLevel: 1 },
        items: [{ label: 'Home' }, { label: 'Services' }, { label: 'API' }],
        theme,
        tone: 'info',
      });

      expect(component.element.getContent()).toBe('Home / … / API');
      expect(component.element.style.fg).toBe('cyan');
    } finally {
      screen.destroy();
    }
  });
});
