import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { actionBar } from '@/adapters/blessed/action-bar.js';

describe('Blessed ActionBar adapter', () => {
  it('navigates, activates, updates, focuses, and destroys its element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onAction = vi.fn();

    try {
      const bar = actionBar({
        box: { mouse: false, width: 60 },
        data: {
          actions: [
            { id: 'run', label: 'Run' },
            { disabled: true, id: 'stop', label: 'Stop' },
            { id: 'retry', label: 'Retry' },
          ],
          capabilities: { unicode: false },
          onAction,
          width: 60,
        },
        parent: screen,
      });

      expect(bar.activeId()).toBe('run');
      expect(bar.next()).toBe('retry');
      expect(bar.activateActive()?.id).toBe('retry');
      expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: 'retry' }));
      bar.element.emit('keypress', '', { name: 'home' });
      expect(bar.activeId()).toBe('run');
      bar.focus();
      expect(screen.focused).toBe(bar.element);
      bar.setData({
        actions: [{ id: 'save', label: 'Save' }],
        capabilities: { unicode: true },
        width: 30,
      });
      expect(bar.activeId()).toBe('save');
      expect(bar.element.getContent()).toContain('▸Save◂');
      bar.destroy();
      expect(screen.children).not.toContain(bar.element);
    } finally {
      screen.destroy();
    }
  });
});
