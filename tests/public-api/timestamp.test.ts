import { describe, expect, it } from 'vitest';

import { renderTimestamp } from '@/index.js';

describe('Timestamp', () => {
  it('renders absolute dates with locale and time zone options', () => {
    expect(
      renderTimestamp({
        locale: 'en-US',
        timeZone: 'UTC',
        value: '2026-06-29T15:30:00Z',
      }),
    ).toBe('Jun 29, 2026, 3:30 PM');
  });

  it('renders relative past, future, and current timestamps', () => {
    expect(
      renderTimestamp({
        format: 'relative',
        now: '2026-06-29T16:00:00Z',
        value: '2026-06-29T15:30:00Z',
      }),
    ).toBe('30 minutes ago');

    expect(
      renderTimestamp({
        format: 'relative',
        now: '2026-06-29T16:00:00Z',
        value: '2026-06-29T18:00:00Z',
      }),
    ).toBe('in 2 hours');

    expect(
      renderTimestamp({
        format: 'relative',
        now: '2026-06-29T16:00:00Z',
        value: '2026-06-29T16:00:00Z',
      }),
    ).toBe('now');
  });

  it('supports truncation and alignment through Text options', () => {
    expect(
      renderTimestamp({
        align: 'right',
        format: 'relative',
        now: '2026-06-29T16:00:00Z',
        overflow: 'truncate',
        value: '2026-06-29T15:30:00Z',
        width: 16,
      }),
    ).toBe('  30 minutes ago');
  });

  it('rejects invalid date values and invalid text dimensions', () => {
    expect(() => renderTimestamp({ value: 'not a date' })).toThrow(RangeError);
    expect(() =>
      renderTimestamp({
        format: 'relative',
        now: 'not a date',
        value: '2026-06-29T15:30:00Z',
      }),
    ).toThrow(RangeError);
    expect(() =>
      renderTimestamp({
        value: '2026-06-29T15:30:00Z',
        width: -1,
      }),
    ).toThrow(RangeError);
  });
});
