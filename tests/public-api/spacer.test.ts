import { describe, expect, it } from 'vitest';

import { calculateSpacerLayout } from '@/index.js';

describe('Spacer', () => {
  it('fills the main axis and stretches the cross axis by default', () => {
    expect(
      calculateSpacerLayout({
        height: 6,
        width: 20,
      }),
    ).toEqual({ height: 6, width: 20 });
  });

  it('supports fixed horizontal and vertical spacers', () => {
    expect(
      calculateSpacerLayout({
        axis: 'horizontal',
        height: 4,
        size: 5,
        width: 20,
      }),
    ).toEqual({ height: 4, width: 5 });
    expect(
      calculateSpacerLayout({
        crossAxis: 'collapse',
        height: 8,
        size: 3,
        width: 12,
      }),
    ).toEqual({ height: 3, width: 0 });
  });

  it('clamps fixed sizes and validates dimensions', () => {
    expect(
      calculateSpacerLayout({
        axis: 'horizontal',
        height: 4,
        size: 50,
        width: 8,
      }),
    ).toEqual({ height: 4, width: 8 });
    expect(() =>
      calculateSpacerLayout({
        height: 4,
        size: -1,
        width: 8,
      }),
    ).toThrow(RangeError);
  });
});
