import { describe, expect, it } from 'vitest';

import { calculateGridLayout } from '@/index.js';

describe('Grid', () => {
  it('auto-places items across evenly distributed columns and rows', () => {
    expect(
      calculateGridLayout({
        columns: 3,
        gap: 1,
        height: 5,
        items: [{}, {}, {}, {}],
        width: 14,
      }),
    ).toEqual([
      { height: 2, width: 4, x: 0, y: 0 },
      { height: 2, width: 4, x: 5, y: 0 },
      { height: 2, width: 4, x: 10, y: 0 },
      { height: 2, width: 4, x: 0, y: 3 },
    ]);
  });

  it('supports explicit placement, spans, and separate gaps', () => {
    expect(
      calculateGridLayout({
        columnGap: 2,
        columns: 4,
        height: 8,
        items: [
          { column: 0, columnSpan: 2, row: 0 },
          { column: 2, columnSpan: 2, row: 0 },
          { column: 0, columnSpan: 4, row: 1 },
        ],
        rowGap: 1,
        rows: 2,
        width: 20,
      }),
    ).toEqual([
      { height: 4, width: 10, x: 0, y: 0 },
      { height: 4, width: 8, x: 12, y: 0 },
      { height: 3, width: 20, x: 0, y: 5 },
    ]);
  });

  it('rejects invalid dimensions and placements', () => {
    expect(() => calculateGridLayout({ columns: 0, height: 4, items: [], width: 10 })).toThrow(
      RangeError,
    );
    expect(() =>
      calculateGridLayout({
        columns: 2,
        height: 4,
        items: [{ column: 1, columnSpan: 2 }],
        width: 10,
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculateGridLayout({
        columns: 2,
        height: 4,
        items: [{ row: 2 }],
        rows: 2,
        width: 10,
      }),
    ).toThrow(RangeError);
  });
});
