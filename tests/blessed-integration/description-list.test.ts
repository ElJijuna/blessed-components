import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { descriptionList } from '@/adapters/blessed/description-list.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed DescriptionList adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = descriptionList({
        box: { height: 2, width: 30 },
        data: {
          items: [
            { term: 'Status', description: 'Online' },
            { term: 'Region', description: 'Lima' },
          ],
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('Status  Online\nRegion  Lima');

      component.setData({
        items: [{ term: 'Status', description: 'Offline' }],
      });

      expect(component.element.getContent()).toBe('Status  Offline');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('uses the shared Box theme contract', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        danger: 'red',
        success: 'cyan',
      },
    });

    try {
      const component = descriptionList({
        data: {
          capabilities: { colorLevel: 1 },
          items: [{ term: 'Status', description: 'Online' }],
          theme,
          tone: 'success',
        },
        parent: screen,
      });

      expect(component.element.style.fg).toBe('cyan');

      component.setData({
        capabilities: { colorLevel: 1 },
        items: [{ term: 'Status', description: 'Offline' }],
        theme,
        tone: 'danger',
      });

      expect(component.element.style.fg).toBe('red');
    } finally {
      screen.destroy();
    }
  });
});
