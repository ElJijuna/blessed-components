import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { progressStack } from '@/adapters/blessed/progress-stack.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed ProgressStack adapter', () => {
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
      const component = progressStack({
        box: { height: 3, width: 20 },
        data: {
          capabilities: { colorLevel: 1, unicode: false },
          segments: [
            { id: 'passed', label: 'Passed', value: 30 },
            { id: 'failed', label: 'Failed', value: 10 },
          ],
          theme,
          tone: 'primary',
          width: 10,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('########==\n# Passed 75%\n= Failed 25%');
      expect(component.element.style.fg).toBe('cyan');

      component.setData({
        capabilities: { colorLevel: 1, unicode: true },
        segments: [{ id: 'done', label: 'Done', value: 1 }],
        showLegend: false,
        theme,
        tone: 'primary',
        width: 4,
      });

      expect(component.element.getContent()).toBe('████');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
