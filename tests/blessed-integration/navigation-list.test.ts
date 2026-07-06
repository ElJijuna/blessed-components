import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { navigationList } from '@/adapters/blessed/navigation-list.js';

describe('Blessed NavigationList adapter', () => {
  it('navigates enabled targets and activates the focused target', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onValueChange = vi.fn();

    try {
      const component = navigationList({
        box: { height: 4, width: 32 },
        data: {
          defaultValue: 'overview',
          items: [
            { id: 'overview', label: 'Overview' },
            { disabled: true, id: 'deploy', label: 'Deploy' },
            { id: 'logs', label: 'Logs', badge: 'live' },
          ],
          onValueChange,
        },
        parent: screen,
      });

      expect(component.focusedId()).toBe('overview');
      expect(component.value()).toBe('overview');

      component.element.emit('keypress', undefined, { name: 'down' });
      component.element.emit('keypress', undefined, { name: 'enter' });

      expect(component.focusedId()).toBe('logs');
      expect(component.value()).toBe('logs');
      expect(onValueChange).toHaveBeenCalledWith('logs');
      expect(component.element.getContent()).toContain('› ● Logs');

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
    const onValueChange = vi.fn();
    const items = [
      { id: 'overview', label: 'Overview' },
      { id: 'logs', label: 'Logs' },
    ] as const;

    try {
      const component = navigationList({
        box: { height: 3, width: 32 },
        data: { items, onValueChange, value: 'overview' },
        parent: screen,
      });

      component.next();
      component.activateFocused();

      expect(onValueChange).toHaveBeenCalledWith('logs');
      expect(component.value()).toBe('overview');
      expect(component.element.getContent()).toContain('  ● Overview');

      component.setData({ items, onValueChange, value: 'logs' });

      expect(component.value()).toBe('logs');
      expect(component.element.getContent()).toContain('● Logs');
    } finally {
      screen.destroy();
    }
  });
});
