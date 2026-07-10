import { describe, expect, it } from 'vitest';

import { renderDateRangePicker } from '@/index.js';

describe('DateRangePicker', () => {
  it('renders start and end labels', () => {
    expect(renderDateRangePicker({ end: '2026-07-10', start: '2026-07-01' })).toBe(
      ['start: 2026-07-01', 'end: 2026-07-10'].join('\n'),
    );
  });
});
