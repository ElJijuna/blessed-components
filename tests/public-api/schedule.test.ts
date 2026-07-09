import { describe, expect, it } from 'vitest';

import { renderSchedule } from '@/index.js';

describe('Schedule', () => {
  it('sorts upcoming events and renders status text', () => {
    expect(
      renderSchedule({
        items: [
          { id: 'b', label: 'Deploy', time: '2026-07-09T10:30:00.000Z' },
          { id: 'a', label: 'Build', status: 'running', time: '2026-07-09T09:00:00.000Z' },
        ],
        locale: 'en-US',
        timeZone: 'UTC',
      }),
    ).toBe(['09:00 AM Build - running', '10:30 AM Deploy'].join('\n'));
  });
});
