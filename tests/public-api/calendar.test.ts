import { describe, expect, it } from 'vitest';

import { renderCalendar } from '@/index.js';

describe('Calendar', () => {
  it('renders month grid with selected date', () => {
    expect(renderCalendar({ month: 7, selectedDate: '2026-07-10', year: 2026 })).toContain('[10]');
  });
});
