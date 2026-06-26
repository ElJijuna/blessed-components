import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { progressList } from '@/adapters/blessed/progress-list.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed ProgressList adapter', () => {
  it('creates, updates, styles, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: { primary: 'cyan' },
    });

    try {
      const component = progressList({
        box: { height: 2, width: 24 },
        data: {
          capabilities: { colorLevel: 1, unicode: false },
          items: [
            { id: 'api', label: 'API', value: 75 },
            { id: 'worker', label: 'Worker', value: 40 },
          ],
          theme,
          tone: 'primary',
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe(
        'API    ##########--- 75%\nWorker #####-------- 40%',
      );
      expect(component.element.style.fg).toBe('cyan');

      component.setData({
        capabilities: { colorLevel: 1, unicode: true },
        items: [{ id: 'api', label: 'API', value: 100 }],
        theme,
        tone: 'primary',
        width: 18,
      });

      expect(component.element.getContent()).toBe('API █████████ 100%');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
