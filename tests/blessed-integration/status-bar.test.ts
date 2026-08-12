import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { statusBar } from '@/adapters/blessed/status-bar.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed StatusBar adapter', () => {
  it('creates, updates, styles, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: { background: 'black', foreground: 'white' },
    });

    try {
      const component = statusBar({
        box: { bottom: 0, height: 1, width: 40 },
        data: {
          capabilities: { colorLevel: 1, unicode: false },
          items: [{ label: 'NORMAL' }, { detail: 'online', label: 'API', section: 'right' }],
          message: 'Ready',
          theme,
          width: 40,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toContain('NORMAL | Ready');
      expect(component.element.getContent()).toContain('API: online');
      expect(component.element.style.fg).toBe('white');

      component.setData({
        capabilities: { colorLevel: 1, unicode: true },
        items: [{ label: 'INSERT' }],
        message: 'Editing',
        theme,
        width: 40,
      });

      expect(component.element.getContent()).toContain('INSERT │ Editing');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
