import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { menu } from '@/adapters/blessed/menu.js';

describe('Blessed Menu adapter', () => {
  it('navigates enabled actions and activates the focused action', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onAction = vi.fn();

    try {
      const component = menu({
        box: { height: 3, width: 30 },
        data: {
          items: [
            { id: 'build', label: 'Build', shortcut: 'b' },
            { disabled: true, id: 'deploy', label: 'Deploy', shortcut: 'd' },
            { id: 'logs', label: 'Logs', shortcut: 'l' },
          ],
          onAction,
        },
        parent: screen,
      });

      expect(component.activeId()).toBe('build');

      component.element.emit('keypress', undefined, { name: 'down' });
      const activated = component.activateActive();

      expect(component.activeId()).toBe('logs');
      expect(activated?.id).toBe('logs');
      expect(onAction).toHaveBeenCalledWith({ id: 'logs', label: 'Logs', shortcut: 'l' });
      expect(component.element.getContent()).toContain('›   Logs');

      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('keeps focus stable across data updates when the action remains enabled', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = menu({
        box: { height: 2, width: 24 },
        data: {
          activeId: 'deploy',
          items: [
            { id: 'build', label: 'Build' },
            { id: 'deploy', label: 'Deploy' },
          ],
        },
        parent: screen,
      });

      component.setData({
        items: [
          { id: 'build', label: 'Build' },
          { id: 'deploy', label: 'Deploy now' },
          { id: 'logs', label: 'Logs' },
        ],
      });

      expect(component.activeId()).toBe('deploy');
      expect(component.element.getContent()).toContain('›   Deploy now');
    } finally {
      screen.destroy();
    }
  });

  it('supports mouse click activation and wheel movement', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onAction = vi.fn();
    const onActiveIdChange = vi.fn();

    try {
      const component = menu({
        box: { height: 3, width: 30 },
        data: {
          items: [
            { id: 'build', label: 'Build' },
            { id: 'test', label: 'Test' },
            { disabled: true, id: 'deploy', label: 'Deploy' },
            { id: 'logs', label: 'Logs' },
          ],
          onAction,
          onActiveIdChange,
        },
        parent: screen,
      });

      expect(screen.clickable).toContain(component.element);

      component.element.emit('click', { y: 1 });

      expect(component.activeId()).toBe('test');
      expect(onActiveIdChange).toHaveBeenCalledWith('test');
      expect(onAction).toHaveBeenCalledWith({ id: 'test', label: 'Test' });

      component.element.emit('click', { y: 2 });

      expect(component.activeId()).toBe('test');
      expect(onAction).toHaveBeenCalledTimes(1);

      component.element.emit('wheeldown');

      expect(component.activeId()).toBe('logs');

      component.element.emit('wheelup');

      expect(component.activeId()).toBe('test');
    } finally {
      screen.destroy();
    }
  });
});
