import { describe, expect, it } from 'vitest';

import { renderTimeline, STATUS_ASCII_MARKERS } from '@/index.js';

describe('Timeline', () => {
  it('renders bounded timeline events with timestamps and status markers', () => {
    expect(
      renderTimeline({
        height: 2,
        items: [
          {
            id: 'queued',
            timestamp: '2026-06-29T15:25:00Z',
            title: 'Deploy queued',
            tone: 'info',
          },
          {
            detail: '24 pods ready',
            id: 'healthy',
            timestamp: '2026-06-29T15:35:00Z',
            title: 'Deploy healthy',
            tone: 'success',
          },
        ],
        timeZone: 'UTC',
        width: 64,
      }),
    ).toBe(
      'i Jun 29, 2026, 3:25 PM Deploy queued\n✓ Jun 29, 2026, 3:35 PM Deploy healthy - 24 pods ready',
    );
  });

  it('supports offsets, hidden timestamps, ASCII markers, and sanitization', () => {
    expect(
      renderTimeline({
        height: 1,
        items: [
          { id: 'first', title: 'First' },
          {
            detail: '\u001B[31mRetrying\u001B[0m',
            id: 'second',
            title: '{bold}Second{/bold}',
            tone: 'warning',
          },
        ],
        markers: STATUS_ASCII_MARKERS,
        offset: 1,
        showTimestamp: false,
        width: 24,
      }),
    ).toBe('! Second - Retrying');
  });

  it('truncates empty and event rows while validating dimensions', () => {
    expect(
      renderTimeline({
        emptyText: 'No events recorded',
        height: 3,
        items: [],
        width: 9,
      }),
    ).toBe('No event…');
    expect(
      renderTimeline({
        height: 1,
        items: [{ id: '1', title: 'A very long event title' }],
        showMarker: false,
        width: 12,
      }),
    ).toBe('A very long…');
    expect(() =>
      renderTimeline({
        height: -1,
        items: [],
        width: 12,
      }),
    ).toThrow(RangeError);
  });
});
