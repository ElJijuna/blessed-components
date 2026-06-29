import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { preformatted } from '@/adapters/blessed/preformatted.js';
import { createTheme } from '@/core/theme.js';

describe('Blessed Preformatted adapter', () => {
  it('renders, scrolls, reports offsets, themes, updates, and destroys preformatted text', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOffsetChange = vi.fn();
    const theme = createTheme({
      colors: {
        foreground: 'white',
        muted: 'grey',
      },
    });

    try {
      const block = preformatted({
        box: { height: 2, width: 6 },
        data: {
          capabilities: { colorLevel: 1 },
          content: '  alpha\nbeta = 2\ngamma',
          onOffsetChange,
          theme,
          tone: 'muted',
        },
        parent: screen,
      });

      expect(block.element.getContent()).toBe('  alph\nbeta =');
      expect(block.element.style.fg).toBe('grey');

      expect(block.scrollTo({ horizontalOffset: 2, verticalOffset: 1 })).toEqual({
        horizontalOffset: 2,
        verticalOffset: 1,
      });
      expect(block.element.getContent()).toBe('ta = 2\nmma');
      expect(onOffsetChange).toHaveBeenLastCalledWith({
        horizontalOffset: 2,
        verticalOffset: 1,
      });

      block.setData({
        content: 'updated value',
      });

      expect(block.element.getContent()).toBe('dated ');

      block.home();

      expect(block.offsets()).toEqual({ horizontalOffset: 0, verticalOffset: 0 });
      expect(block.element.getContent()).toBe('update');

      block.destroy();

      expect(screen.children).not.toContain(block.element);
    } finally {
      screen.destroy();
    }
  });

  it('supports keyboard navigation', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const block = preformatted({
        box: { height: 2, width: 5 },
        data: {
          content: 'alpha\nbravo\ncharlie',
        },
        parent: screen,
      });

      block.element.emit('keypress', undefined, { name: 'down' });
      block.element.emit('keypress', undefined, { name: 'right' });

      expect(block.offsets()).toEqual({ horizontalOffset: 1, verticalOffset: 1 });
      expect(block.element.getContent()).toBe('ravo\nharli');

      block.element.emit('keypress', undefined, { name: 'home' });

      expect(block.offsets()).toEqual({ horizontalOffset: 0, verticalOffset: 0 });
      expect(block.element.getContent()).toBe('alpha\nbravo');
    } finally {
      screen.destroy();
    }
  });
});
