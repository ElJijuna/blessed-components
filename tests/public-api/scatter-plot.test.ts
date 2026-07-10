import { describe, expect, it } from 'vitest';

import { renderScatterPlot } from '@/index.js';

describe('ScatterPlot', () => {
  it('renders points on a grid', () => {
    expect(
      renderScatterPlot({
        height: 3,
        points: [{ x: 1, y: 1 }],
        width: 3,
        xDomain: { max: 2, min: 0 },
        yDomain: { max: 2, min: 0 },
      }),
    ).toBe(['   ', ' * ', '   '].join('\n'));
  });
});
