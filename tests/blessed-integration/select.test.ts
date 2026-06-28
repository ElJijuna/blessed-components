import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { select } from '@/adapters/blessed/select.js';

describe('Blessed Select adapter', () => {
  const items = [
    { id: 'prod', label: 'Production' },
    { id: 'stage', label: 'Staging' },
    { disabled: true, id: 'dev', label: 'Development' },
  ] as const;

  it('opens, navigates, selects uncontrolled value, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();

    try {
      const component = select({
        box: { height: 4, width: 24 },
        data: { items, onOpenChange, onValueChange, placeholder: 'Choose env' },
        parent: screen,
      });

      expect(component.value()).toBeUndefined();
      expect(component.opened()).toBe(false);
      expect(component.element.getContent()).toBe('▸ Choose env');

      component.open();
      component.next();
      component.selectActive();

      expect(component.value()).toBe('stage');
      expect(component.opened()).toBe(false);
      expect(component.element.getContent()).toBe('▸ Staging');
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onValueChange).toHaveBeenCalledWith('stage');

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled value and open state unchanged until data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();

    try {
      const component = select({
        box: { height: 4, width: 24 },
        data: { items, onOpenChange, onValueChange, open: false, value: 'prod' },
        parent: screen,
      });

      component.open();

      expect(component.opened()).toBe(false);
      expect(onOpenChange).toHaveBeenCalledWith(true);

      component.setData({ items, onOpenChange, onValueChange, open: true, value: 'prod' });
      component.next();
      component.selectActive();

      expect(onValueChange).toHaveBeenCalledWith('stage');
      expect(component.value()).toBe('prod');

      component.setData({ items, onOpenChange, onValueChange, open: false, value: 'stage' });

      expect(component.value()).toBe('stage');
      expect(component.element.getContent()).toBe('▸ Staging');
    } finally {
      screen.destroy();
    }
  });

  it('handles keyboard open, selection, and escape close', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = select({
        box: { height: 4, width: 24 },
        data: { defaultValue: 'prod', items },
        parent: screen,
      });

      component.element.emit('keypress', undefined, { name: 'space' });
      expect(component.opened()).toBe(true);

      component.element.emit('keypress', undefined, { name: 'escape' });
      expect(component.opened()).toBe(false);

      component.element.emit('keypress', undefined, { name: 'down' });
      component.element.emit('keypress', undefined, { name: 'enter' });

      expect(component.value()).toBe('stage');
    } finally {
      screen.destroy();
    }
  });
});
