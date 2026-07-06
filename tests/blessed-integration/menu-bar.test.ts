import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { menuBar } from '@/adapters/blessed/menu-bar.js';

describe('Blessed MenuBar adapter', () => {
  it('navigates enabled menus and activates the focused menu', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onActivate = vi.fn();

    try {
      const component = menuBar({
        box: { height: 1, width: 50 },
        data: {
          defaultValue: 'file',
          items: [
            { id: 'file', label: 'File' },
            { disabled: true, id: 'edit', label: 'Edit' },
            { id: 'view', label: 'View' },
          ],
          onActivate,
        },
        parent: screen,
      });

      expect(component.activeId()).toBe('file');
      expect(component.value()).toBe('file');

      component.element.emit('keypress', undefined, { name: 'right' });
      component.element.emit('keypress', undefined, { name: 'enter' });

      expect(component.activeId()).toBe('view');
      expect(component.value()).toBe('view');
      expect(onActivate).toHaveBeenCalledWith('view');
      expect(component.element.getContent()).toContain('›● View');

      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled value unchanged until new data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onActivate = vi.fn();
    const items = [
      { id: 'file', label: 'File' },
      { id: 'view', label: 'View' },
    ] as const;

    try {
      const component = menuBar({
        box: { height: 1, width: 40 },
        data: { items, onActivate, value: 'file' },
        parent: screen,
      });

      component.next();
      component.activateFocused();

      expect(onActivate).toHaveBeenCalledWith('view');
      expect(component.value()).toBe('file');
      expect(component.element.getContent()).toContain('● File');

      component.setData({ items, onActivate, value: 'view' });

      expect(component.value()).toBe('view');
      expect(component.element.getContent()).toContain('● View');
    } finally {
      screen.destroy();
    }
  });
});
