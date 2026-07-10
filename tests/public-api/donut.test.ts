import { describe, expect, it } from 'vitest';

import { renderDonut } from '@/index.js';

describe('Donut', () => {
  it('renders totals and percentages', () => {
    expect(
      renderDonut({
        segments: [
          { label: 'used', value: 7 },
          { label: 'free', value: 3 },
        ],
      }),
    ).toBe(['total: 10', 'used: 7 (70%)', 'free: 3 (30%)'].join('\n'));
  });
});
