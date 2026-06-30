import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { virtualList } from '@/adapters/blessed/virtual-list.js';

describe('Blessed VirtualList adapter', () => {
  it('scrolls a large list by row and page while reporting offsets', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOffsetChange = vi.fn();
    const items = Array.from({ length: 12 }, (_, index) => ({
      id: String(index),
      label: `Item ${index}`,
    }));

    try {
      const view = virtualList({
        box: { height: 3, width: 14 },
        data: { items, onOffsetChange },
        parent: screen,
      });

      view.element.emit('keypress', undefined, { name: 'down' });

      expect(view.offset()).toBe(1);
      expect(view.element.getContent()).toBe('    Item 1\n    Item 2\n    Item 3');
      expect(onOffsetChange).toHaveBeenLastCalledWith(1);

      view.pageForward();

      expect(view.offset()).toBe(4);
      expect(view.element.getContent()).toBe('    Item 4\n    Item 5\n    Item 6');

      view.end();

      expect(view.offset()).toBe(9);
      expect(view.element.getContent()).toBe('    Item 9\n    Item 10\n    Item 11');
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
    const items = [
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
      { id: 'three', label: 'Three' },
    ] as const;

    try {
      const view = virtualList({
        box: { height: 2, width: 14 },
        data: { items, offset: 0, onOffsetChange },
        parent: screen,
      });

      view.next();

      expect(onOffsetChange).toHaveBeenCalledWith(1);
      expect(view.offset()).toBe(0);
      expect(view.element.getContent()).toBe('    One\n    Two');

      view.setData({ items, offset: 1, onOffsetChange });

      expect(view.offset()).toBe(1);
      expect(view.element.getContent()).toBe('    Two\n    Three');
    } finally {
      screen.destroy();
    }
  });
});
