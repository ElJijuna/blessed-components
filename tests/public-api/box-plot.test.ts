import { describe, expect, it } from 'vitest';

import { renderBoxPlot } from '@/index.js';

describe('BoxPlot', () => {
  it('renders statistical summary track', () => {
    expect(
      renderBoxPlot({
        items: [
          { label: 'latency', lowerQuartile: 2, max: 4, median: 3, min: 0, upperQuartile: 4 },
        ],
        width: 5,
      }),
    ).toBe('latency [| =*|]');
  });
});
