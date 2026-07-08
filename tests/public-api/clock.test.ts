import { describe, expect, it } from 'vitest';

import { renderClock } from '@/index.js';

describe('Clock', () => {
  it('renders deterministic zoned time', () => {
    expect(
      renderClock({
        label: 'UTC',
        timeZone: 'UTC',
        value: '2026-07-08T12:00:00Z',
        width: 40,
      }),
    ).toBe('UTC Jul 8, 2026, 12:00 PM');
  });
});
