import { describe, expect, it } from 'vitest';

import { renderLineChart } from '@/index.js';

describe('LineChart', () => {
  it('renders sampled series as compact glyph rows', () => {
    expect(
      renderLineChart({
        max: 7,
        min: 0,
        series: [{ label: 'cpu', values: [0, 3, 7] }],
        width: 3,
      }),
    ).toBe('cpu: _-#');
  });
});
