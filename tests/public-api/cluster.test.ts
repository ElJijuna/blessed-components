import { describe, expect, it } from 'vitest';

import { calculateClusterLayout } from '@/index.js';

describe('Cluster', () => {
  it('wraps items into rows with consistent gaps', () => {
    expect(
      calculateClusterLayout({
        gap: 1,
        height: 5,
        items: [
          { height: 1, width: 6 },
          { height: 2, width: 7 },
          { height: 1, width: 5 },
        ],
        width: 14,
      }),
    ).toEqual([
      { height: 1, width: 6, x: 0, y: 0 },
      { height: 2, width: 7, x: 7, y: 0 },
      { height: 1, width: 5, x: 0, y: 3 },
    ]);
  });

  it('aligns each wrapped row independently', () => {
    expect(
      calculateClusterLayout({
        align: 'center',
        columnGap: 2,
        height: 4,
        items: [
          { height: 1, width: 5 },
          { height: 1, width: 5 },
          { height: 1, width: 4 },
        ],
        rowGap: 1,
        width: 12,
      }),
    ).toEqual([
      { height: 1, width: 5, x: 0, y: 0 },
      { height: 1, width: 5, x: 7, y: 0 },
      { height: 1, width: 4, x: 4, y: 2 },
    ]);
  });

  it('clamps oversized item widths and validates dimensions', () => {
    expect(
      calculateClusterLayout({
        height: 2,
        items: [{ height: 3, width: 20 }],
        width: 8,
      }),
    ).toEqual([{ height: 2, width: 8, x: 0, y: 0 }]);
    expect(() =>
      calculateClusterLayout({
        gap: -1,
        height: 2,
        items: [],
        width: 8,
      }),
    ).toThrow(RangeError);
  });
});
