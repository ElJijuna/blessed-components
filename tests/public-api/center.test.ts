import { describe, expect, it } from 'vitest';

import { calculateCenterLayout } from '@/index.js';

describe('Center', () => {
  it('centers one item in the available rectangle', () => {
    expect(
      calculateCenterLayout({
        height: 10,
        item: { height: 4, width: 8 },
        width: 20,
      }),
    ).toEqual({ height: 4, width: 8, x: 6, y: 3 });
  });

  it('supports per-axis alignment and stretch', () => {
    expect(
      calculateCenterLayout({
        height: 8,
        horizontal: 'end',
        item: { height: 3, width: 5 },
        vertical: 'stretch',
        width: 18,
      }),
    ).toEqual({ height: 8, width: 5, x: 13, y: 0 });
  });

  it('clamps oversized items and validates dimensions', () => {
    expect(
      calculateCenterLayout({
        height: 3,
        item: { height: 10, width: 12 },
        width: 6,
      }),
    ).toEqual({ height: 3, width: 6, x: 0, y: 0 });
    expect(() =>
      calculateCenterLayout({
        height: 2,
        item: { height: 1, width: -1 },
        width: 8,
      }),
    ).toThrow(RangeError);
  });
});
