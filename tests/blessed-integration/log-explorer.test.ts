import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { logExplorer } from '@/adapters/blessed/log-explorer.js';

describe('Blessed LogExplorer adapter', () => {
  it('filters, appends, scrolls, pauses, resumes, and reports changes', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onFilteredEntriesChange = vi.fn();
    const onFilterChange = vi.fn();
    const onPausedChange = vi.fn();

    try {
      const logs = logExplorer({
        box: { height: 2, width: 28 },
        data: {
          entries: [
            { id: '1', level: 'info', message: 'Deploy started', source: 'api' },
            { id: '2', level: 'warn', message: 'Queue latency high', source: 'worker' },
            { id: '3', level: 'error', message: 'Deploy failed', source: 'api' },
          ],
          filter: { query: 'deploy' },
          follow: false,
          onFilteredEntriesChange,
          onFilterChange,
          onPausedChange,
        },
        parent: screen,
      });

      expect(logs.filteredEntries().map(({ id }) => id)).toEqual(['1', '3']);
      expect(logs.element.getContent()).toBe('│ i [api] Deploy started\n│ ! [api] Deploy failed');

      logs.setFilter({ levels: ['warn'] });

      expect(onFilterChange).toHaveBeenCalledWith({ levels: ['warn'] });
      expect(logs.filteredEntries().map(({ id }) => id)).toEqual(['2']);
      expect(logs.element.getContent()).toBe('│ ▲ [worker] Queue latency …');

      logs.append({ id: '4', level: 'warn', message: 'Worker recovered', source: 'worker' });
      logs.element.emit('keypress', undefined, { name: 'down' });

      expect(logs.filteredEntries().map(({ id }) => id)).toEqual(['2', '4']);
      expect(logs.element.getContent()).toContain('Worker recover…');

      logs.element.emit('keypress', undefined, { name: 'space' });
      logs.append({ id: '5', level: 'warn', message: 'Paused entry', source: 'worker' });

      expect(logs.isPaused()).toBe(true);
      expect(logs.pendingEntries()).toEqual([
        { id: '5', level: 'warn', message: 'Paused entry', source: 'worker' },
      ]);
      expect(onPausedChange).toHaveBeenCalledWith(true);

      logs.element.emit('keypress', undefined, { name: 'space' });

      expect(logs.isPaused()).toBe(false);
      expect(logs.filteredEntries().map(({ id }) => id)).toEqual(['2', '4', '5']);
      expect(onPausedChange).toHaveBeenCalledWith(false);

      logs.destroy();
      expect(screen.children).not.toContain(logs.element);
    } finally {
      screen.destroy();
    }
  });
});
