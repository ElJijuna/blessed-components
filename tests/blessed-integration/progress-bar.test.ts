import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { progressBar } from '@/adapters/blessed/progress-bar.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed ProgressBar adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const input = new PassThrough();
    const output = new PassThrough();
    const screen = blessed.screen({ input, output, terminal: 'xterm-256color' });

    try {
      const component = progressBar({
        box: { height: 1, width: 20 },
        data: { value: 25, width: 4 },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('█░░░ 25%');

      component.setData({ value: 75, width: 4 });

      expect(component.element.getContent()).toBe('███░ 75%');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('updates semantic color through the shared Box theme contract', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        danger: 'magenta',
        success: 'green',
      },
    });

    try {
      const component = progressBar({
        box: { height: 1, width: 20 },
        data: {
          capabilities: { colorLevel: 1 },
          theme,
          tone: 'success',
          value: 25,
          width: 4,
        },
        parent: screen,
      });

      expect(component.element.style.fg).toBe('green');

      component.setData({
        capabilities: { colorLevel: 1 },
        theme,
        tone: 'danger',
        value: 75,
        width: 4,
      });

      expect(component.element.style.fg).toBe('magenta');
    } finally {
      screen.destroy();
    }
  });
});
