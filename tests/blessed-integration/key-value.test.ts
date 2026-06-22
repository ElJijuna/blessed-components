import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { keyValue } from '@/adapters/blessed/key-value.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed KeyValue adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = keyValue({
        box: { height: 2, width: 30 },
        data: {
          items: [
            { key: 'Status', value: 'Online' },
            { key: 'Region', value: 'Lima' },
          ],
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('Status : Online\nRegion : Lima');

      component.setData({
        items: [{ key: 'Status', value: 'Offline' }],
      });

      expect(component.element.getContent()).toBe('Status : Offline');
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
      const component = keyValue({
        data: {
          capabilities: { colorLevel: 1 },
          items: [{ key: 'Status', value: 'Online' }],
          theme,
          tone: 'success',
        },
        parent: screen,
      });

      expect(component.element.style.fg).toBe('cyan');

      component.setData({
        capabilities: { colorLevel: 1 },
        items: [{ key: 'Status', value: 'Offline' }],
        theme,
        tone: 'danger',
      });

      expect(component.element.style.fg).toBe('red');
    } finally {
      screen.destroy();
    }
  });
});
