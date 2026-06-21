import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { list } from '../../src/adapters/blessed/list.js';

describe('Blessed List adapter', () => {
  it('navigates enabled items and selects the active item', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onValueChange = vi.fn();

    try {
      const component = list({
        box: { height: 3, width: 20 },
        data: {
          defaultValue: 'one',
          items: [
            { id: 'one', label: 'One' },
            { disabled: true, id: 'two', label: 'Two' },
            { id: 'three', label: 'Three' },
          ],
          onValueChange,
        },
        parent: screen,
      });

      expect(component.activeId()).toBe('one');
      expect(component.value()).toBe('one');

      component.element.emit('keypress', undefined, { name: 'down' });
      component.element.emit('keypress', undefined, { name: 'enter' });

      expect(component.activeId()).toBe('three');
      expect(component.value()).toBe('three');
      expect(onValueChange).toHaveBeenCalledWith('three');
      expect(component.element.getContent()).toContain('› ● Three');

      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled selection unchanged until new data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onValueChange = vi.fn();
    const items = [
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
    ] as const;

    try {
      const component = list({
        box: { height: 2, width: 20 },
        data: { items, onValueChange, value: 'one' },
        parent: screen,
      });

      component.next();
      component.selectActive();

      expect(onValueChange).toHaveBeenCalledWith('two');
      expect(component.value()).toBe('one');
      expect(component.element.getContent()).toContain('● One');

      component.setData({ items, onValueChange, value: 'two' });

      expect(component.value()).toBe('two');
      expect(component.element.getContent()).toContain('● Two');
    } finally {
      screen.destroy();
    }
  });

  it('keeps Home, End, and paging on enabled visible items', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = list({
        box: { height: 2, width: 20 },
        data: {
          items: [
            { disabled: true, id: 'zero', label: 'Zero' },
            { id: 'one', label: 'One' },
            { disabled: true, id: 'two', label: 'Two' },
            { id: 'three', label: 'Three' },
            { id: 'four', label: 'Four' },
          ],
        },
        parent: screen,
      });

      component.element.emit('keypress', undefined, { name: 'end' });
      expect(component.activeId()).toBe('four');
      expect(component.element.getContent()).toContain('›   Four');

      component.element.emit('keypress', undefined, { name: 'home' });
      expect(component.activeId()).toBe('one');
      expect(component.element.getContent()).toContain('›   One');

      component.element.emit('keypress', undefined, { name: 'pagedown' });
      expect(component.activeId()).toBe('three');
      expect(component.element.getContent()).toContain('›   Three');
    } finally {
      screen.destroy();
    }
  });
});
