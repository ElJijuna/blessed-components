import { describe, expect, it } from 'vitest';

import { JOB_QUEUE_ASCII_CHARACTERS, renderJobQueue, renderJobQueueModel } from '@/index.js';

describe('JobQueue', () => {
  const items = [
    {
      cancellable: true,
      id: 'export',
      label: 'Export {bold}report{/bold}',
      progress: 42,
      status: 'running',
    },
    {
      detail: 'network timeout',
      id: 'email',
      label: 'Send email',
      retry: { attempt: 2, maxAttempts: 3, nextAt: '10:05' },
      retryable: true,
      status: 'failed',
    },
  ] as const;

  it('renders a summary, progress, metadata, and available actions', () => {
    expect(
      renderJobQueue({ activeId: 'export', characters: JOB_QUEUE_ASCII_CHARACTERS, items }),
    ).toBe(
      [
        'Jobs 2 · running 1 · failed 1',
        '> RUNNING Export report 42% [cancel]',
        '  FAILED Send email - network timeout attempt 2/3 next 10:05 [retry]',
      ].join('\n'),
    );
  });

  it('clips job rows after reserving the summary and does not mutate input', () => {
    expect(renderJobQueueModel({ height: 2, items, newestFirst: true, width: 80 })).toEqual({
      content:
        'Jobs 2 · running 1 · failed 1\n  FAILED Send email - network timeout attempt 2/3 next 10:05 [↻]',
      visibleItemIds: ['email'],
    });
    expect(items[0]?.id).toBe('export');
  });

  it('validates dimensions, identity, progress, and retry attempts', () => {
    expect(() => renderJobQueue({ items, width: -1 })).toThrow(RangeError);
    expect(() => renderJobQueue({ items: [{ id: '', label: 'job', status: 'queued' }] })).toThrow(
      RangeError,
    );
    expect(() =>
      renderJobQueue({ items: [{ id: 'x', label: 'job', progress: 101, status: 'running' }] }),
    ).toThrow(RangeError);
    expect(() =>
      renderJobQueue({
        items: [
          { id: 'x', label: 'one', status: 'queued' },
          { id: 'x', label: 'two', status: 'queued' },
        ],
      }),
    ).toThrow(RangeError);
  });
});
