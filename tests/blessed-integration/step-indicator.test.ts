import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { stepIndicator } from '@/adapters/blessed/step-indicator.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed StepIndicator adapter', () => {
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
      const component = stepIndicator({
        box: { height: 4, width: 24 },
        data: {
          capabilities: { colorLevel: 1, unicode: false },
          steps: [
            { id: 'install', label: 'Install', state: 'completed' },
            { detail: 'compiling', id: 'build', label: 'Build', state: 'active' },
          ],
          theme,
          tone: 'primary',
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('+ Install\n> Build - compiling');
      expect(component.element.style.fg).toBe('cyan');

      component.setData({
        capabilities: { colorLevel: 1, unicode: true },
        orientation: 'horizontal',
        steps: [
          { id: 'install', label: 'Install', state: 'completed' },
          { id: 'build', label: 'Build', state: 'completed' },
          { id: 'deploy', label: 'Deploy', state: 'active' },
        ],
        theme,
        tone: 'primary',
        width: 40,
      });

      expect(component.element.getContent()).toBe('✓ Install  ✓ Build  ● Deploy');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
