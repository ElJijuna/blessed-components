import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { scrollArea } from '@/adapters/blessed/scroll-area.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed ScrollArea adapter', () => {
  it('scrolls composable content with keyboard, wheel, and imperative methods', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOffsetChange = vi.fn();

    try {
      const component = scrollArea({
        box: { height: 5, width: 10 },
        data: {
          contentHeight: 12,
          onOffsetChange,
        },
        parent: screen,
      });
      const child = blessed.box({
        content: 'row',
        height: 1,
        parent: component.contentElement,
        top: 8,
        width: 4,
      });

      component.focus();
      component.element.emit('keypress', undefined, { name: 'down' });

      expect(component.offset()).toBe(1);
      expect(component.contentElement.top).toBe(-1);
      expect(component.scrollbarElement.getContent()).toBe('█\n█\n┃\n┃\n┃');

      component.element.emit('wheeldown');
      expect(component.offset()).toBe(2);

      component.element.emit('keypress', undefined, { name: 'pagedown' });
      expect(component.offset()).toBe(6);

      component.end();
      expect(component.offset()).toBe(7);
      expect(child.parent).toBe(component.contentElement);

      component.home();
      expect(component.offset()).toBe(0);
      expect(onOffsetChange).toHaveBeenCalled();

      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled offset unchanged until new data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOffsetChange = vi.fn();

    try {
      const component = scrollArea({
        box: { height: 4, width: 10 },
        data: {
          contentHeight: 10,
          offset: 0,
          onOffsetChange,
        },
        parent: screen,
      });

      component.lineForward();

      expect(onOffsetChange).toHaveBeenCalledWith(1);
      expect(component.offset()).toBe(0);
      expect(component.contentElement.top).toBe(0);

      component.setData({
        contentHeight: 10,
        offset: 1,
        onOffsetChange,
      });

      expect(component.offset()).toBe(1);
      expect(component.contentElement.top).toBe(-1);
    } finally {
      screen.destroy();
    }
  });

  it('re-measures dimensions, updates page overlap, and applies theme', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: {
        primary: 'cyan',
        success: 'green',
      },
    });

    try {
      const component = scrollArea({
        box: {
          border: 'line',
          height: 7,
          width: 12,
        },
        data: {
          borderTone: 'success',
          capabilities: { colorLevel: 1 },
          contentHeight: 20,
          pageOverlap: 1,
          scrollbarTone: 'primary',
          theme,
        },
        parent: screen,
      });

      expect(component.metrics()).toMatchObject({ viewportSize: 5 });
      expect(component.contentElement.width).toBe(9);
      expect(component.element.style.border?.fg).toBe('green');
      expect(component.scrollbarElement.style.fg).toBe('cyan');

      component.pageForward();
      expect(component.offset()).toBe(4);

      component.setData({
        capabilities: { colorLevel: 1 },
        contentHeight: 20,
        pageOverlap: 3,
        showScrollbar: false,
        theme,
      });
      component.home();
      component.pageForward();

      expect(component.offset()).toBe(2);
      expect(component.scrollbarElement.hidden).toBe(true);
      expect(component.contentElement.width).toBe(10);

      component.element.height = 9;
      component.resize();

      expect(component.metrics()).toMatchObject({ viewportSize: 7 });
    } finally {
      screen.destroy();
    }
  });
});
