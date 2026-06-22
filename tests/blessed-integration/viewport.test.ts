import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { viewport } from '@/adapters/blessed/viewport.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Viewport adapter', () => {
  it('scrolls a composable content element within visible bounds', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = viewport({
        box: { height: 5, width: 10 },
        data: {
          contentHeight: 20,
          contentWidth: 40,
        },
        parent: screen,
      });
      const child = blessed.box({
        content: 'content',
        height: 1,
        left: 7,
        parent: component.contentElement,
        top: 3,
        width: 7,
      });

      expect(component.snapshot()).toMatchObject({
        height: 5,
        width: 10,
        x: 0,
        y: 0,
      });

      component.scrollTo({ x: 7, y: 3 });

      expect(component.contentElement.position).toMatchObject({
        height: 20,
        left: -7,
        top: -3,
        width: 40,
      });
      expect(child.parent).toBe(component.contentElement);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('clamps scrolling, ensures regions are visible, and preserves offsets on updates', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = viewport({
        box: { height: 5, width: 10 },
        data: {
          contentHeight: 20,
          contentWidth: 40,
          x: 4,
          y: 2,
        },
        parent: screen,
      });

      expect(component.snapshot()).toMatchObject({ x: 4, y: 2 });

      expect(
        component.ensureVisible({
          height: 2,
          width: 3,
          x: 20,
          y: 10,
        }),
      ).toMatchObject({ x: 13, y: 7 });

      component.setData({
        contentHeight: 15,
        contentWidth: 25,
      });

      expect(component.snapshot()).toMatchObject({ x: 13, y: 7 });

      component.scrollTo({ x: 100, y: 100 });

      expect(component.snapshot()).toMatchObject({ x: 15, y: 10 });
    } finally {
      screen.destroy();
    }
  });

  it('re-measures visible dimensions and applies the shared Box theme', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        border: 'blue',
        primary: 'cyan',
      },
    });

    try {
      const component = viewport({
        box: {
          border: 'line',
          height: 7,
          width: 12,
        },
        data: {
          borderTone: 'primary',
          capabilities: { colorLevel: 1 },
          contentHeight: 20,
          contentWidth: 30,
          theme,
        },
        parent: screen,
      });

      expect(component.snapshot()).toMatchObject({ height: 5, width: 10 });
      expect(component.element.style.border?.fg).toBe('cyan');

      component.element.width = 22;
      component.element.height = 12;
      component.resize();

      expect(component.snapshot()).toMatchObject({ height: 10, width: 20 });
    } finally {
      screen.destroy();
    }
  });
});
