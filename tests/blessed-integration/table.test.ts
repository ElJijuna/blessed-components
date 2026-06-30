import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { table } from '@/adapters/blessed/table.js';

describe('Blessed Table adapter', () => {
  it('navigates enabled rows and selects the active row', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onValueChange = vi.fn();

    try {
      const component = table({
        box: { height: 5, width: 24 },
        data: {
          columns: [
            { header: 'Name', id: 'name' },
            { align: 'right', header: 'CPU', id: 'cpu', width: 4 },
          ],
          defaultValue: 'one',
          onValueChange,
          rows: [
            { cpu: '1%', id: 'one', name: 'One' },
            { cpu: '2%', disabled: true, id: 'two', name: 'Two' },
            { cpu: '3%', id: 'three', name: 'Three' },
          ],
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
    const columns = [{ header: 'Name', id: 'name' }] as const;
    const rows = [
      { id: 'one', name: 'One' },
      { id: 'two', name: 'Two' },
    ] as const;

    try {
      const component = table({
        box: { height: 4, width: 20 },
        data: { columns, onValueChange, rows, value: 'one' },
        parent: screen,
      });

      component.next();
      component.selectActive();

      expect(onValueChange).toHaveBeenCalledWith('two');
      expect(component.value()).toBe('one');
      expect(component.element.getContent()).toContain('● One');

      component.setData({ columns, onValueChange, rows, value: 'two' });

      expect(component.value()).toBe('two');
      expect(component.element.getContent()).toContain('● Two');
    } finally {
      screen.destroy();
    }
  });

  it('supports mouse click selection and wheel movement', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onValueChange = vi.fn();
    const onActiveIdChange = vi.fn();

    try {
      const component = table({
        box: { height: 5, width: 24 },
        data: {
          columns: [
            { header: 'Name', id: 'name' },
            { align: 'right', header: 'CPU', id: 'cpu', width: 4 },
          ],
          onActiveIdChange,
          onValueChange,
          rows: [
            { cpu: '1%', id: 'one', name: 'One' },
            { cpu: '2%', id: 'two', name: 'Two' },
            { cpu: '3%', disabled: true, id: 'three', name: 'Three' },
            { cpu: '4%', id: 'four', name: 'Four' },
          ],
        },
        parent: screen,
      });

      expect(screen.clickable).toContain(component.element);

      component.element.emit('click', { y: 3 });

      expect(component.activeId()).toBe('two');
      expect(component.value()).toBe('two');
      expect(onActiveIdChange).toHaveBeenCalledWith('two');
      expect(onValueChange).toHaveBeenCalledWith('two');

      component.element.emit('click', { y: 4 });

      expect(component.activeId()).toBe('two');
      expect(component.value()).toBe('two');
      expect(onValueChange).toHaveBeenCalledTimes(1);

      component.element.emit('wheeldown');

      expect(component.activeId()).toBe('four');

      component.element.emit('wheelup');

      expect(component.activeId()).toBe('two');
    } finally {
      screen.destroy();
    }
  });
});
