import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { tabList } from '@/adapters/blessed/tab-list.js';

describe('Blessed TabList adapter', () => {
  it('navigates enabled triggers and activates the focused trigger', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onActivate = vi.fn();

    try {
      const component = tabList({
        box: { height: 1, width: 50 },
        data: {
          defaultValue: 'overview',
          items: [
            { id: 'overview', label: 'Overview' },
            { disabled: true, id: 'deploy', label: 'Deploy' },
            { id: 'logs', label: 'Logs' },
          ],
          onActivate,
        },
        parent: screen,
      });

      expect(component.activeId()).toBe('overview');
      expect(component.value()).toBe('overview');

      component.element.emit('keypress', undefined, { name: 'right' });
      component.element.emit('keypress', undefined, { name: 'enter' });

      expect(component.activeId()).toBe('logs');
      expect(component.value()).toBe('logs');
      expect(onActivate).toHaveBeenCalledWith('logs');
      expect(component.element.getContent()).toContain('› <Logs>');

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
      { id: 'overview', label: 'Overview' },
      { id: 'logs', label: 'Logs' },
    ] as const;

    try {
      const component = tabList({
        box: { height: 1, width: 40 },
        data: { items, onActivate, value: 'overview' },
        parent: screen,
      });

      component.next();
      component.activateFocused();

      expect(onActivate).toHaveBeenCalledWith('logs');
      expect(component.value()).toBe('overview');
      expect(component.element.getContent()).toContain('<Overview>');

      component.setData({ items, onActivate, value: 'logs' });

      expect(component.value()).toBe('logs');
      expect(component.element.getContent()).toContain('<Logs>');
    } finally {
      screen.destroy();
    }
  });
});
