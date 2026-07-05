import { describe, expect, it } from 'vitest';

import { createToastStackState, renderToast, renderToastStack } from '@/index.js';

describe('Toast', () => {
  it('renders a sanitized wrapped toast', () => {
    expect(
      renderToast({
        description: 'Promoted {bold}production{/bold} after health checks.',
        id: 'deploy',
        title: '\u001B[31mDeploy complete\u001B[39m',
        tone: 'success',
        width: 24,
      }),
    ).toBe('+ Deploy complete\n  Promoted production af\n  ter health checks.');
  });

  it('renders a stack with configurable gaps', () => {
    expect(
      renderToastStack({
        gap: 0,
        toasts: [
          { id: 'a', title: 'Saved', tone: 'success' },
          { id: 'b', title: 'Retry queued', tone: 'warning' },
        ],
        width: 20,
      }),
    ).toBe('+ Saved\n! Retry queued');
  });

  it('keeps newest toasts first, dedupes ids, and prunes expired items', () => {
    const state = createToastStackState({
      maxToasts: 2,
      toasts: [
        { createdAt: 0, durationMs: 100, id: 'old', title: 'Old' },
        { createdAt: 10, durationMs: 100, id: 'build', title: 'Build started' },
      ],
    });

    expect(state.list().map((toast) => toast.id)).toEqual(['build', 'old']);

    state.add({ createdAt: 20, durationMs: 100, id: 'deploy', title: 'Deploy started' });
    expect(state.list().map((toast) => toast.id)).toEqual(['deploy', 'build']);

    state.add({ createdAt: 30, durationMs: 100, id: 'build', title: 'Build updated' });
    expect(state.list().map((toast) => toast.id)).toEqual(['build', 'deploy']);
    expect(state.list()[0]?.title).toBe('Build updated');

    state.prune(121);
    expect(state.list().map((toast) => toast.id)).toEqual(['build']);
  });

  it('rejects invalid toast data', () => {
    expect(() => renderToast({ id: 'bad', title: '', width: 20 })).toThrow(RangeError);
    expect(() => renderToast({ id: 'bad', title: 'Bad', width: 0 })).toThrow(RangeError);
    expect(() => createToastStackState({ maxToasts: 0 })).toThrow(RangeError);
  });
});
