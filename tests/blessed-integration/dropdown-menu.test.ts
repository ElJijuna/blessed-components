import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { dropdownMenu } from '@/adapters/blessed/dropdown-menu.js';
import type { DropdownMenuItem } from '@/components/navigation/dropdown-menu/index.js';
import type { MenuItem } from '@/components/navigation/menu/index.js';

describe('Blessed DropdownMenu adapter', () => {
  const items: readonly DropdownMenuItem<MenuItem>[] = [
    {
      id: 'file',
      items: [
        { id: 'new', label: 'New', shortcut: 'n' },
        { id: 'open', label: 'Open', shortcut: 'o' },
      ],
      label: 'File',
    },
    {
      id: 'view',
      items: [
        { id: 'logs', label: 'Logs' },
        { disabled: true, id: 'debug', label: 'Debug' },
      ],
      label: 'View',
    },
  ] as const;

  it('opens, navigates, activates, and closes with keyboard', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onAction = vi.fn();
    const onOpenIdChange = vi.fn();

    try {
      const component = dropdownMenu({
        box: { height: 4, width: 26 },
        data: { items, onAction, onOpenIdChange },
        parent: screen,
      });

      expect(component.focusedId()).toBe('file');
      expect(component.openId()).toBeUndefined();

      component.element.emit('keypress', undefined, { name: 'down' });
      component.element.emit('keypress', undefined, { name: 'down' });
      component.element.emit('keypress', undefined, { name: 'enter' });

      expect(onOpenIdChange).toHaveBeenCalledWith('file');
      expect(onAction).toHaveBeenCalledWith('file', { id: 'open', label: 'Open', shortcut: 'o' });
      expect(component.openId()).toBeUndefined();

      component.element.emit('keypress', undefined, { name: 'right' });
      component.element.emit('keypress', undefined, { name: 'space' });

      expect(component.focusedId()).toBe('view');
      expect(component.openId()).toBe('view');
      expect(component.element.getContent()).toContain('›   Logs');

      component.element.emit('keypress', undefined, { name: 'escape' });

      expect(component.openId()).toBeUndefined();
    } finally {
      screen.destroy();
    }
  });

  it('supports mouse open and action activation', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onAction = vi.fn();

    try {
      const component = dropdownMenu({
        box: { height: 4, width: 26 },
        data: { items, onAction },
        parent: screen,
      });

      expect(screen.clickable).toContain(component.element);

      component.element.emit('click', { x: 1, y: 0 });
      expect(component.openId()).toBe('file');

      component.element.emit('click', { x: 1, y: 2 });
      expect(onAction).toHaveBeenCalledWith('file', { id: 'open', label: 'Open', shortcut: 'o' });
      expect(component.openId()).toBeUndefined();
    } finally {
      screen.destroy();
    }
  });

  it('honors focusedId updates through setData', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = dropdownMenu({
        box: { height: 4, width: 26 },
        data: { items },
        parent: screen,
      });

      component.setData({ focusedId: 'view', items });

      expect(component.focusedId()).toBe('view');
      expect(component.element.getContent()).toContain('›  View');
    } finally {
      screen.destroy();
    }
  });

  it('uses visible label width for menu bar mouse hit testing', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = dropdownMenu({
        box: { height: 4, width: 26 },
        data: {
          items: [
            {
              id: 'file',
              items: [{ id: 'new', label: 'New' }],
              label: '{bold}F{/bold}',
            },
            {
              id: 'view',
              items: [{ id: 'logs', label: 'Logs' }],
              label: 'View',
            },
          ],
        },
        parent: screen,
      });

      component.element.emit('click', { x: 6, y: 0 });

      expect(component.openId()).toBe('view');
    } finally {
      screen.destroy();
    }
  });
});
