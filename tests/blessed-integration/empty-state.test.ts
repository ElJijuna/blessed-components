import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { emptyState } from '@/adapters/blessed/empty-state.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed EmptyState adapter', () => {
  it('creates, updates, styles, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: { muted: 'grey', primary: 'cyan' },
    });

    try {
      const component = emptyState({
        box: { height: 5, width: 24 },
        data: {
          capabilities: { colorLevel: 1 },
          description: 'Create one to continue',
          theme,
          title: 'No projects',
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('     ○ No projects\n\n Create one to continue');
      expect(component.element.style.fg).toBe('grey');

      component.setData({
        capabilities: { colorLevel: 1 },
        showMarker: false,
        theme,
        title: 'Ready',
        tone: 'primary',
      });

      expect(component.element.getContent()).toBe('         Ready');
      expect(component.element.style.fg).toBe('cyan');
      expect(screen.children).toContain(component.element);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
