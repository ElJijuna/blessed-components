import { describe, expect, it } from 'vitest';

import { renderCalendarHeatmap } from '@/index.js';

describe('CalendarHeatmap', () => {
  it('renders seven activity rows', () => {
    expect(
      renderCalendarHeatmap({
        days: [0, 1, 2, 3, 4, 0, 4].map((value, index) => ({
          date: `2026-07-${String(index + 1).padStart(2, '0')}`,
          value,
        })),
        height: 7,
        max: 4,
        width: 4,
      }),
    ).toBe('·\n░\n▒\n▓\n█\n·\n█');
  });
});
