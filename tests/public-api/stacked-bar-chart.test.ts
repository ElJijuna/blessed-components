import { describe, expect, it } from 'vitest';

import { renderStackedBarChart } from '@/index.js';

describe('StackedBarChart', () => {
  it('renders segment composition', () => {
    expect(
      renderStackedBarChart({
        items: [
          {
            label: 'api',
            segments: [
              { label: 'ok', value: 7 },
              { label: 'err', value: 3 },
            ],
          },
        ],
        width: 10,
      }),
    ).toBe('api | #######=== 10');
  });
});
