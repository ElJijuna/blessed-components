import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { pager } from '@/adapters/blessed/pager.js';

describe('Blessed Pager adapter', () => {
  it('navigates pages through keys, wheel, methods, and cleanup', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onPageChange = vi.fn();

    try {
      const component = pager({
        box: { height: 1, width: 40 },
        data: { defaultPage: 2, onPageChange, pageCount: 5 },
        parent: screen,
      });

      expect(component.page()).toBe(2);
      expect(component.element.getContent()).toContain('Page 2/5');

      component.element.emit('keypress', undefined, { name: 'right' });
      component.element.emit('keypress', undefined, { name: 'end' });
      component.element.emit('wheelup');

      expect(component.page()).toBe(4);
      expect(onPageChange).toHaveBeenLastCalledWith(4);
      expect(component.element.getContent()).toContain('Page 4/5');

      expect(component.first()).toBe(1);
      expect(component.last()).toBe(5);
      expect(component.previous()).toBe(4);
      expect(component.next()).toBe(5);

      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled page unchanged until new data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onPageChange = vi.fn();

    try {
      const component = pager({
        box: { height: 1, width: 28 },
        data: { onPageChange, page: 1, pageCount: 4 },
        parent: screen,
      });

      component.next();

      expect(onPageChange).toHaveBeenCalledWith(2);
      expect(component.page()).toBe(1);
      expect(component.element.getContent()).toContain('Page 1/4');

      component.setData({ onPageChange, page: 2, pageCount: 4 });

      expect(component.page()).toBe(2);
      expect(component.element.getContent()).toContain('Page 2/4');
    } finally {
      screen.destroy();
    }
  });
});
