import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { multiSelect } from '@/adapters/blessed/multi-select.js';

describe('Blessed MultiSelect adapter', () => {
  const items = [
    { id: 'api', label: 'API' },
    { id: 'worker', label: 'Worker' },
    { disabled: true, id: 'db', label: 'Database' },
  ] as const;

  it('opens, navigates, toggles uncontrolled values, clears, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOpenChange = vi.fn();
    const onValuesChange = vi.fn();

    try {
      const component = multiSelect({
        box: { height: 4, width: 24 },
        data: { defaultValues: ['api'], items, onOpenChange, onValuesChange },
        parent: screen,
      });

      expect(component.values()).toEqual(['api']);
      expect(component.element.getContent()).toBe('▸ API');

      component.open();
      component.next();
      component.toggleActive();

      expect(component.values()).toEqual(['api', 'worker']);
      expect(component.opened()).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(onValuesChange).toHaveBeenCalledWith(['api', 'worker']);

      expect(component.clear()).toBe(true);
      expect(component.values()).toEqual([]);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled values unchanged until new data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onValuesChange = vi.fn();

    try {
      const component = multiSelect({
        box: { height: 4, width: 24 },
        data: { items, onValuesChange, open: true, values: ['api'] },
        parent: screen,
      });

      component.next();
      component.toggleActive();

      expect(onValuesChange).toHaveBeenCalledWith(['api', 'worker']);
      expect(component.values()).toEqual(['api']);

      component.setData({ items, onValuesChange, open: false, values: ['api', 'worker'] });

      expect(component.values()).toEqual(['api', 'worker']);
      expect(component.element.getContent()).toBe('▸ API, Worker');
    } finally {
      screen.destroy();
    }
  });

  it('handles keyboard open, toggle, and escape close', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = multiSelect({
        box: { height: 4, width: 24 },
        data: { items },
        parent: screen,
      });

      component.element.emit('keypress', undefined, { name: 'space' });
      expect(component.opened()).toBe(true);

      component.element.emit('keypress', undefined, { name: 'space' });
      expect(component.values()).toEqual(['api']);

      component.element.emit('keypress', undefined, { name: 'escape' });
      expect(component.opened()).toBe(false);
    } finally {
      screen.destroy();
    }
  });
});
