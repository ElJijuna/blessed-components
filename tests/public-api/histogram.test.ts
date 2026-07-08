import { describe, expect, it } from 'vitest';

import { createHistogramBins, renderHistogram } from '@/index.js';

describe('Histogram', () => {
  it('groups finite values into bins and renders horizontal bars', () => {
    expect(createHistogramBins([1, 2, 3, 9], 2).map(({ count }) => count)).toEqual([3, 1]);
    expect(
      renderHistogram({
        barWidth: 4,
        binCount: 2,
        height: 2,
        values: [1, 2, 3, 9],
        width: 20,
      }),
    ).toBe('1-5 ████ 3\n5-9 █░░░ 1');
  });
});
