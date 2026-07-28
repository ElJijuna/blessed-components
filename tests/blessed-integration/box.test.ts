import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { box } from '@/adapters/blessed/box.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Box adapter', () => {
  it('applies semantic colors while preserving explicit Blessed style overrides', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        background: 'black',
        border: 'cyan',
        foreground: 'white',
      },
    });

    try {
      const component = box({
        box: {
          border: 'line',
          height: 5,
          padding: 2,
          style: { fg: 'yellow' },
          width: 30,
        },
        data: {
          capabilities: { colorLevel: 1 },
          theme,
        },
        parent: screen,
      });
      const { element } = component;

      expect(element.style.fg).toBe('yellow');
      expect(element.style.bg).toBe('black');
      expect(element.style.border?.fg).toBe('cyan');
      expect(
        (
          element as typeof element & {
            padding: { bottom: number; left: number; right: number; top: number };
          }
        ).padding,
      ).toEqual({ bottom: 2, left: 2, right: 2, top: 2 });

      component.setData({
        capabilities: { colorLevel: 0 },
        theme,
      });

      expect(component.element).toBe(element);
      expect(element.style.fg).toBe('yellow');
      expect(element.style.bg).toBeUndefined();
      expect(element.style.border?.fg).toBeUndefined();

      component.destroy();

      expect(screen.children).not.toContain(element);
    } finally {
      screen.destroy();
    }
  });

  it('applies component colors, active variants, border structure, and density padding', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      activeVariant: 'panel',
      colors: {
        background: 'black',
        foreground: 'white',
      },
      components: {
        box: { foreground: 'green' },
      },
      variants: {
        panel: {
          borders: { character: '#', style: 'background' },
          colors: { background: 'blue' },
          spacing: { paddingX: 2, paddingY: 1 },
        },
      },
    });

    try {
      const component = box({
        box: { height: 7, width: 30 },
        data: {
          capabilities: { colorLevel: 1 },
          theme,
        },
        parent: screen,
      });
      const element = component.element as typeof component.element & {
        padding: { bottom: number; left: number; right: number; top: number };
      };

      expect(element.style.fg).toBe('green');
      expect(element.style.bg).toBe('blue');
      expect(element.border).toMatchObject({ ch: '#', type: 'bg' });
      expect(element.padding).toEqual({ bottom: 1, left: 2, right: 2, top: 1 });

      component.setData({
        capabilities: { colorLevel: 1 },
      });

      expect(element.border).toBeUndefined();
      expect(element.padding).toEqual({ bottom: 0, left: 0, right: 0, top: 0 });

      component.destroy();
    } finally {
      screen.destroy();
    }
  });
});
