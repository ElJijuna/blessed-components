import { describe, expect, it } from 'vitest';

import { renderCountdown } from '@/index.js';

describe('Countdown', () => {
  it('renders remaining time and completion label', () => {
    expect(
      renderCountdown({
        endsAt: '2026-07-09T01:00:00.000Z',
        label: 'Deploy',
        now: '2026-07-09T00:00:00.000Z',
      }),
    ).toBe('Deploy: 01:00:00');
    expect(renderCountdown({ endsAt: 0, now: 1 })).toBe('complete');
  });
});
