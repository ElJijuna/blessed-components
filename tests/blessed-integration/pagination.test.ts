import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { pagination } from '@/adapters/blessed/pagination.js';

describe('Blessed Pagination adapter', () => {
  it('navigates pages through keys, wheel, methods, and cleanup', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onPageChange = vi.fn();

    try {
      const component = pagination({
        box: { height: 1, width: 40 },
        data: { defaultPage: 2, onPageChange, pageCount: 5, showBoundaryControls: true },
        parent: screen,
      });

      expect(component.page()).toBe(2);
      expect(component.element.getContent()).toContain('[2]');

      component.element.emit('keypress', undefined, { name: 'right' });
      component.element.emit('keypress', undefined, { name: 'end' });
      component.element.emit('wheelup');

      expect(component.page()).toBe(4);
      expect(onPageChange).toHaveBeenLastCalledWith(4);
      expect(component.element.getContent()).toContain('[4]');

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
      const component = pagination({
        box: { height: 1, width: 20 },
        data: { onPageChange, page: 1, pageCount: 4 },
        parent: screen,
      });

      component.next();

      expect(onPageChange).toHaveBeenCalledWith(2);
      expect(component.page()).toBe(1);
      expect(component.element.getContent()).toContain('[1]');

      component.setData({ onPageChange, page: 2, pageCount: 4 });

      expect(component.page()).toBe(2);
      expect(component.element.getContent()).toContain('[2]');
    } finally {
      screen.destroy();
    }
  });
});
