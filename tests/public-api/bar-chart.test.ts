import { describe, expect, it } from 'vitest';

import { renderBarChart } from '@/index.js';

describe('BarChart', () => {
  it('renders categorical bars against a fixed domain', () => {
    expect(
      renderBarChart({
        items: [
          { label: 'api', value: 5 },
          { label: 'web', value: 10 },
        ],
        max: 10,
        width: 4,
      }),
    ).toBe(['api | ##   5', 'web | #### 10'].join('\n'));
  });
});
