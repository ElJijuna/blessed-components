import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { logViewer } from '@/adapters/blessed/log-viewer.js';

describe('Blessed LogViewer adapter', () => {
  it('appends, follows, pauses, resumes, clears, and reports changes', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onEntriesChange = vi.fn();
    const onPausedChange = vi.fn();

    try {
      const logs = logViewer({
        box: { height: 2, width: 24 },
        data: {
          maxEntries: 3,
          onEntriesChange,
          onPausedChange,
        },
        parent: screen,
      });

      logs.append({ id: '1', message: 'one' });
      logs.appendMany([
        { id: '2', message: 'two' },
        { id: '3', message: 'three' },
        { id: '4', message: 'four' },
      ]);

      expect(logs.entries().map(({ id }) => id)).toEqual(['2', '3', '4']);
      expect(logs.element.getContent()).toBe('│ i three\n│ i four');
      expect(onEntriesChange).toHaveBeenLastCalledWith([
        { id: '2', message: 'two' },
        { id: '3', message: 'three' },
        { id: '4', message: 'four' },
      ]);

      logs.pause();
      logs.append({ id: '5', message: 'five' });

      expect(logs.isPaused()).toBe(true);
      expect(logs.pendingEntries()).toEqual([{ id: '5', message: 'five' }]);
      expect(logs.entries().map(({ id }) => id)).toEqual(['2', '3', '4']);
      expect(onPausedChange).toHaveBeenCalledWith(true);

      logs.resume();

      expect(logs.entries().map(({ id }) => id)).toEqual(['3', '4', '5']);
      expect(logs.pendingEntries()).toEqual([]);
      expect(onPausedChange).toHaveBeenCalledWith(false);

      logs.clear();

      expect(logs.entries()).toEqual([]);
      expect(logs.element.getContent()).toBe('No log entries');
    } finally {
      screen.destroy();
    }
  });

  it('supports keyboard scrolling and pause toggling', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOffsetChange = vi.fn();

    try {
      const logs = logViewer({
        box: { height: 2, width: 18 },
        data: {
          follow: false,
          onOffsetChange,
        },
        parent: screen,
      });

      logs.appendMany([
        { id: '1', message: 'one' },
        { id: '2', message: 'two' },
        { id: '3', message: 'three' },
      ]);

      logs.element.emit('keypress', undefined, { name: 'down' });

      expect(logs.element.getContent()).toBe('│ i two\n│ i three');
      expect(onOffsetChange).toHaveBeenCalledWith(1);

      logs.element.emit('keypress', undefined, { name: 'space' });

      expect(logs.isPaused()).toBe(true);

      logs.element.emit('keypress', undefined, { name: 'space' });

      expect(logs.isPaused()).toBe(false);
    } finally {
      screen.destroy();
    }
  });
});
