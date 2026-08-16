import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { routeTabs } from '@/adapters/blessed/route-tabs.js';

describe('Blessed RouteTabs adapter', () => {
  const items = [
    { id: 'overview', label: 'Overview' },
    { closable: true, dirty: true, id: 'editor', label: 'Editor' },
    { closable: true, disabled: true, id: 'deploy', label: 'Deploy' },
  ] as const;

  it('navigates enabled routes and requests closing closeable routes', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onClose = vi.fn();
    const onNavigate = vi.fn();

    try {
      const component = routeTabs({
        box: { height: 1, width: 60 },
        data: {
          capabilities: { unicode: false },
          defaultRouteId: 'overview',
          items,
          onClose,
          onNavigate,
        },
        parent: screen,
      });

      expect(component.activeId()).toBe('overview');
      expect(component.routeId()).toBe('overview');
      expect(component.next()).toBe('editor');
      expect(component.navigateActive()).toBe('editor');
      expect(component.routeId()).toBe('editor');
      expect(onNavigate).toHaveBeenCalledWith('editor');

      component.element.emit('keypress', undefined, { name: 'delete' });

      expect(onClose).toHaveBeenCalledWith(items[1]);
      expect(component.closeRoute('overview')).toBeUndefined();
      expect(component.closeRoute('deploy')).toBeUndefined();
    } finally {
      screen.destroy();
    }
  });

  it('keeps a controlled route unchanged until updated data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onNavigate = vi.fn();

    try {
      const component = routeTabs({
        box: { height: 1, width: 60 },
        data: { items, onNavigate, routeId: 'overview' },
        parent: screen,
      });

      component.focusRoute('editor');
      component.navigateActive();

      expect(onNavigate).toHaveBeenCalledWith('editor');
      expect(component.routeId()).toBe('overview');

      component.setData({ items, onNavigate, routeId: 'editor' });

      expect(component.routeId()).toBe('editor');
      expect(component.element.getContent()).toContain('[Editor x]');
    } finally {
      screen.destroy();
    }
  });
});
