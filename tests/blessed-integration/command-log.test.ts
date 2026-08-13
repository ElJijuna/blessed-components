import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { commandLog } from '@/adapters/blessed/command-log.js';
import type { CommandLogItem } from '@/components/developer-tools/command-log/index.js';

describe('Blessed CommandLog adapter', () => {
  it('navigates, delegates retries, updates, focuses, and destroys its element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onRetry = vi.fn();

    try {
      const log = commandLog<CommandLogItem>({
        box: { height: 4, width: 70 },
        data: {
          capabilities: { unicode: false },
          items: [
            { command: 'build', id: 'build', status: 'succeeded' },
            { command: 'deploy', id: 'deploy', retryable: true, status: 'failed' },
          ],
          onRetry,
        },
        parent: screen,
      });

      expect(log.activeId()).toBe('build');
      expect(log.next()).toBe('deploy');
      expect(log.retryActive()?.id).toBe('deploy');
      expect(onRetry).toHaveBeenCalledWith(expect.objectContaining({ id: 'deploy' }));
      log.element.emit('keypress', '', { name: 'home' });
      expect(log.retryActive()).toBeUndefined();
      log.focus();
      expect(screen.focused).toBe(log.element);
      log.setData({ items: [{ command: 'release', id: 'release', status: 'running' }] });
      expect(log.activeId()).toBe('release');
      expect(log.element.getContent()).toContain('RUNNING release');
      log.destroy();
      expect(screen.children).not.toContain(log.element);
    } finally {
      screen.destroy();
    }
  });
});
