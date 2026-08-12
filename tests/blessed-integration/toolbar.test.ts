import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { toolbar } from '@/adapters/blessed/toolbar.js';

describe('Blessed Toolbar adapter', () => {
  it('navigates, activates, updates, focuses, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onAction = vi.fn();

    try {
      const bar = toolbar({
        box: { mouse: false, width: 60 },
        data: {
          capabilities: { unicode: false },
          items: [
            { icon: '+', id: 'create', label: 'Create' },
            { disabled: true, icon: '×', id: 'delete', label: 'Delete' },
            { icon: 'R', id: 'refresh', label: 'Refresh' },
          ],
          onAction,
          width: 60,
        },
        parent: screen,
      });

      expect(bar.activeId()).toBe('create');
      expect(bar.next()).toBe('refresh');
      expect(bar.activateActive()?.id).toBe('refresh');
      expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'refresh' }));
      bar.element.emit('keypress', '', { name: 'home' });
      expect(bar.activeId()).toBe('create');
      bar.focus();
      expect(screen.focused).toBe(bar.element);
      bar.setData({
        capabilities: { unicode: true },
        items: [{ icon: '✓', id: 'save', label: 'Save' }],
        width: 30,
      });
      expect(bar.element.getContent()).toContain('▸✓ Save◂');
      bar.destroy();
      expect(screen.children).not.toContain(bar.element);
    } finally {
      screen.destroy();
    }
  });
});
