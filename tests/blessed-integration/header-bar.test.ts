import { PassThrough } from 'node:stream';
import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';
import { headerBar } from '@/adapters/blessed/header-bar.js';

describe('Blessed HeaderBar adapter', () => {
  it('navigates, activates, updates, focuses, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onAction = vi.fn();

    try {
      const header = headerBar({
        data: {
          actions: [
            { id: 'refresh', label: 'Refresh' },
            { disabled: true, id: 'deploy', label: 'Deploy' },
            { id: 'settings', label: 'Settings' },
          ],
          capabilities: { colorLevel: 0, unicode: false },
          onAction,
          title: 'Console',
          width: 60,
        },
        parent: screen,
      });

      expect(header.element.top).toBe(0);
      expect(header.activeActionId()).toBe('refresh');
      expect(header.next()).toBe('settings');
      expect(header.activateActive()?.id).toBe('settings');
      expect(onAction).toHaveBeenCalledOnce();
      header.focus();
      expect(screen.focused).toBe(header.element);
      header.setData({ title: 'Admin', width: 40 });
      expect(header.element.getContent()).toContain('Admin');
      header.destroy();
      expect(screen.children).not.toContain(header.element);
    } finally {
      screen.destroy();
    }
  });
});
