import { describe, expect, it } from 'vitest';

import { COMMAND_LOG_ASCII_CHARACTERS, renderCommandLog, renderCommandLogModel } from '@/index.js';

describe('CommandLog', () => {
  const items = [
    { command: 'npm test', duration: '2s', id: '1', status: 'succeeded', timestamp: '10:00' },
    {
      command: 'deploy {bold}prod{/bold}',
      exitCode: 1,
      id: '2',
      retry: { attempt: 2, maxAttempts: 3, nextAt: '10:05' },
      retryable: true,
      status: 'failed',
      timestamp: '10:01',
    },
  ] as const;

  it('renders structured execution and retry metadata', () => {
    expect(
      renderCommandLog({
        activeId: '2',
        characters: COMMAND_LOG_ASCII_CHARACTERS,
        items,
      }),
    ).toBe(
      [
        '  10:00 SUCCEEDED npm test 2s',
        '> 10:01 FAILED deploy prod exit 1 attempt 2/3 next 10:05 retry',
      ].join('\n'),
    );
  });

  it('supports newest-first ordering and bounded output without mutating input', () => {
    expect(renderCommandLogModel({ height: 1, items, newestFirst: true, width: 80 })).toEqual({
      content: '  10:01 FAILED deploy prod exit 1 attempt 2/3 next 10:05 ↻',
      visibleItemIds: ['2'],
    });
    expect(items[0]?.id).toBe('1');
  });

  it('validates dimensions, required text, and retry attempts', () => {
    expect(() => renderCommandLog({ items, width: -1 })).toThrow(RangeError);
    expect(() => renderCommandLog({ items: [{ command: '', id: 'x', status: 'queued' }] })).toThrow(
      RangeError,
    );
    expect(() =>
      renderCommandLog({
        items: [
          { command: 'run', id: 'x', retry: { attempt: 2, maxAttempts: 1 }, status: 'failed' },
        ],
      }),
    ).toThrow(RangeError);
  });
});
