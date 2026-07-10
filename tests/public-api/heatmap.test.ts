import { describe, expect, it } from 'vitest';

import { renderHeatmap } from '@/index.js';

describe('Heatmap', () => {
  it('renders matrix values as intensity cells', () => {
    expect(
      renderHeatmap({
        characters: ' .#',
        max: 2,
        min: 0,
        values: [
          [0, 1, 2],
          [2, 1, 0],
        ],
      }),
    ).toBe([' .#', '#. '].join('\n'));
  });
});
