import { PassThrough } from 'node:stream';
import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';
import { breadcrumbBar } from '@/adapters/blessed/breadcrumb-bar.js';

describe('Blessed BreadcrumbBar adapter', () => {
  it('navigates, activates, updates, focuses, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onAction = vi.fn();
    const onNavigateSibling = vi.fn();

    try {
      const navigation = breadcrumbBar({
        data: {
          actions: [{ id: 'refresh', label: 'Refresh' }],
          capabilities: { colorLevel: 0, unicode: false },
          items: [{ label: 'Projects' }, { label: 'API' }],
          nextSibling: { id: 'worker', label: 'Worker' },
          onAction,
          onNavigateSibling,
          previousSibling: { disabled: true, id: 'web', label: 'Web' },
          width: 60,
        },
        parent: screen,
      });

      expect(navigation.activeTarget()).toBe('next');
      expect(navigation.activateActive()).toMatchObject({ id: 'worker' });
      expect(onNavigateSibling).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'worker' }),
        'next',
      );
      expect(navigation.next()).toBe('action:refresh');
      expect(navigation.activateActive()).toMatchObject({ id: 'refresh' });
      expect(onAction).toHaveBeenCalledOnce();
      navigation.focus();
      expect(screen.focused).toBe(navigation.element);
      navigation.setData({ items: [{ label: 'Home' }], width: 30 });
      expect(navigation.element.getContent()).toContain('Home');
      navigation.destroy();
      expect(screen.children).not.toContain(navigation.element);
    } finally {
      screen.destroy();
    }
  });
});
