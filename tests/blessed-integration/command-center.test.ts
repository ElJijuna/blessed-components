import { PassThrough } from 'node:stream';
import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';
import { commandCenter } from '@/adapters/blessed/command-center.js';

describe('Blessed CommandCenter adapter', () => {
  it('searches, navigates, executes, updates, focuses, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onExecute = vi.fn();

    try {
      const center = commandCenter({
        box: { height: 10, width: 60 },
        data: {
          items: [
            { id: 'deploy', label: 'Deploy' },
            { disabled: true, id: 'rollback', label: 'Rollback' },
            { id: 'logs', label: 'Logs' },
          ],
          onExecute,
        },
        parent: screen,
      });

      expect(center.activeId()).toBe('deploy');
      expect(center.next()).toBe('logs');
      expect(center.executeActive()?.id).toBe('logs');
      expect(onExecute).toHaveBeenCalledOnce();
      center.setQuery('dep');
      expect(center.activeId()).toBe('deploy');
      center.clearQuery();
      center.focus();
      expect(screen.focused).toBe(center.element);
      center.setData({ items: [{ id: 'quit', label: 'Quit' }] });
      expect(center.activeId()).toBe('quit');
      center.destroy();
      expect(screen.children).not.toContain(center.element);
    } finally {
      screen.destroy();
    }
  });
});
