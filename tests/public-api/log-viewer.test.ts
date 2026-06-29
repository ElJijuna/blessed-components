import { describe, expect, it } from 'vitest';

import { createLogViewerState, renderLogViewer } from '@/index.js';

describe('LogViewer', () => {
  it('renders bounded, sanitized log rows', () => {
    expect(
      renderLogViewer({
        entries: [
          {
            id: '1',
            level: 'info',
            message: '{bold}Server started{/bold}',
            source: 'api',
          },
          {
            id: '2',
            level: 'error',
            message: '\u001B[31mConnection failed\u001B[0m',
          },
        ],
        height: 2,
        width: 28,
      }),
    ).toBe('│ i [api] Server started\n│ ! Connection failed');
  });

  it('retains the newest entries and queues appends while paused', () => {
    const logs = createLogViewerState({
      defaultPaused: true,
      entries: [{ id: '1', message: 'first' }],
      maxEntries: 2,
    });

    logs.append({ id: '2', message: 'second' });
    logs.append({ id: '3', message: 'third' });

    expect(logs.entries()).toEqual([{ id: '1', message: 'first' }]);
    expect(logs.pendingEntries()).toEqual([
      { id: '2', message: 'second' },
      { id: '3', message: 'third' },
    ]);

    expect(logs.resume()).toEqual([
      { id: '2', message: 'second' },
      { id: '3', message: 'third' },
    ]);
    expect(logs.pendingEntries()).toEqual([]);
  });

  it('validates dimensions and retention limits', () => {
    expect(() =>
      renderLogViewer({
        entries: [],
        height: -1,
        width: 10,
      }),
    ).toThrow(RangeError);
    expect(() => createLogViewerState({ maxEntries: 0 })).toThrow(RangeError);
  });
});
