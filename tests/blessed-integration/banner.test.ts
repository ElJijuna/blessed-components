import { PassThrough } from 'node:stream';
import blessed from 'blessed';
import { describe, expect, it } from 'vitest';
import { banner } from '@/adapters/blessed/banner.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Banner adapter', () => {
  it('creates, updates, styles, and destroys a full-width element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = banner({
        parent: screen,
        box: { height: 1, width: 24 },
        data: {
          capabilities: { colorLevel: 1, unicode: false },
          message: 'Deployments paused',
          theme: createTheme(),
          tone: 'warning',
        },
      });

      expect(component.element.getContent()).toBe('! Deployments paused    ');
      component.setData({
        capabilities: { colorLevel: 1, unicode: true },
        message: 'Service restored',
        theme: createTheme(),
        tone: 'success',
      });
      expect(component.element.getContent()).toBe('✓ Service restored      ');
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
