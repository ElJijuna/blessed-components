import { describe, expect, it } from 'vitest';

import { parseDateInput, renderDateInput } from '@/index.js';

describe('DateInput', () => {
  it('renders safe date text and validates ISO dates with bounds', () => {
    expect(
      renderDateInput({
        focused: true,
        label: 'Start',
        value: '{bold}2026-07-09{/bold}',
        width: 20,
      }),
    ).toBe(['Start:', '> 2026-07-09', '? YYYY-MM-DD'].join('\n'));
    expect(parseDateInput('2026-02-29').valid).toBe(false);
    expect(parseDateInput('2026-07-09', { min: '2026-01-01', max: '2026-12-31' })).toMatchObject({
      input: '2026-07-09',
      valid: true,
    });
  });
});
