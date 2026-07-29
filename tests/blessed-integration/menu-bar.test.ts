import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { menuBar } from '@/adapters/blessed/menu-bar.js';

describe('Blessed MenuBar adapter', () => {
  it('activates an item from a real terminal mouse sequence', () => {
    const input = new PassThrough();
    const screen = blessed.screen({
      input,
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onActivate = vi.fn();

    try {
      menuBar({
        box: { height: 1, left: 2, top: 3, width: 50 },
        data: {
          defaultValue: 'overview',
          items: [
            { id: 'overview', label: 'Overview' },
            { id: 'traffic', label: 'Traffic' },
            { id: 'deploys', label: 'Deploys' },
          ],
          onActivate,
        },
        parent: screen,
      });
      const mouseModes = (
        screen.program as typeof screen.program & {
          _currentMouse?: Record<string, boolean>;
        }
      )._currentMouse;

      expect(mouseModes?.sgrMouse).toBe(true);

      screen.render();

      input.write('\u001B[<0;20;4M');
      input.write('\u001B[<0;20;4m');

      expect(onActivate).toHaveBeenCalledWith('traffic');
    } finally {
      screen.destroy();
    }
  });

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

      component.element.emit('click', { x: 11 });

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

  it('activates enabled menus by click and ignores disabled menus and separators', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onActivate = vi.fn();
    const onActiveIdChange = vi.fn();

    try {
      const component = menuBar({
        box: { height: 1, width: 40 },
        data: {
          items: [
            { id: 'file', label: 'File' },
            { disabled: true, id: 'edit', label: 'Edit' },
            { id: 'view', label: 'View' },
          ],
          onActivate,
          onActiveIdChange,
        },
        parent: screen,
      });

      expect(screen.clickable).toContain(component.element);

      component.element.emit('click', { x: 10 });
      component.element.emit('click', { x: 8 });

      expect(component.activeId()).toBe('file');
      expect(component.value()).toBeUndefined();
      expect(onActivate).not.toHaveBeenCalled();

      component.element.emit('click', { x: 20 });

      expect(component.activeId()).toBe('view');
      expect(component.value()).toBe('view');
      expect(onActiveIdChange).toHaveBeenCalledWith('view');
      expect(onActivate).toHaveBeenCalledWith('view');
    } finally {
      screen.destroy();
    }
  });

  it('uses visible label width and box offsets for click hit testing', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onActivate = vi.fn();

    try {
      const component = menuBar({
        box: { height: 1, left: 3, padding: { left: 1 }, width: 30 },
        data: {
          items: [
            { id: 'file', label: '{bold}F{/bold}' },
            { id: 'view', label: 'View' },
          ],
          onActivate,
        },
        parent: screen,
      });

      component.element.emit('click', { x: 10 });

      expect(component.activeId()).toBe('view');
      expect(component.value()).toBe('view');
      expect(onActivate).toHaveBeenCalledWith('view');
    } finally {
      screen.destroy();
    }
  });
});
