import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { jobQueue } from '@/adapters/blessed/job-queue.js';
import type { JobQueueItem } from '@/components/developer-tools/job-queue/index.js';

describe('Blessed JobQueue adapter', () => {
  it('navigates, delegates actions, updates, focuses, and destroys its element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onCancel = vi.fn();
    const onRetry = vi.fn();

    try {
      const queue = jobQueue<JobQueueItem>({
        box: { height: 5, width: 70 },
        data: {
          capabilities: { unicode: false },
          items: [
            { cancellable: true, id: 'build', label: 'Build', status: 'running' },
            { id: 'deploy', label: 'Deploy', retryable: true, status: 'failed' },
          ],
          onCancel,
          onRetry,
        },
        parent: screen,
      });

      expect(queue.activeId()).toBe('build');
      expect(queue.cancelActive()?.id).toBe('build');
      expect(onCancel).toHaveBeenCalledWith(expect.objectContaining({ id: 'build' }));
      expect(queue.next()).toBe('deploy');
      expect(queue.retryActive()?.id).toBe('deploy');
      expect(onRetry).toHaveBeenCalledWith(expect.objectContaining({ id: 'deploy' }));
      queue.element.emit('keypress', '', { name: 'home' });
      expect(queue.retryActive()).toBeUndefined();
      queue.focus();
      expect(screen.focused).toBe(queue.element);
      queue.setData({ items: [{ id: 'release', label: 'Release', status: 'queued' }] });
      expect(queue.activeId()).toBe('release');
      expect(queue.element.getContent()).toContain('QUEUED Release');
      queue.destroy();
      expect(screen.children).not.toContain(queue.element);
    } finally {
      screen.destroy();
    }
  });
});
