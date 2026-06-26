import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { taskProgress } from '@/adapters/blessed/task-progress.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed TaskProgress adapter', () => {
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
      const component = taskProgress({
        box: { height: 5, width: 20 },
        data: {
          activity: 'Running checks',
          capabilities: { colorLevel: 1, unicode: false },
          theme,
          title: 'Release',
          tone: 'primary',
          value: 50,
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('> Release\nRunning checks\n########------- 50%');
      expect(component.element.style.fg).toBe('cyan');

      component.setData({
        capabilities: { colorLevel: 1, unicode: true },
        showProgress: false,
        status: 'success',
        theme,
        title: 'Done',
        tone: 'primary',
      });

      expect(component.element.getContent()).toBe('✓ Done');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
