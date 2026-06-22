import { describe, expect, it } from 'vitest';

import { calculateStackLayout } from '@/index.js';

describe('Stack', () => {
  it('lays out vertical items with a consistent gap and stretched cross axis', () => {
    expect(
      calculateStackLayout({
        gap: 1,
        height: 10,
        items: [{ height: 2 }, { height: 3 }, { height: 1 }],
        width: 20,
      }),
    ).toEqual([
      { height: 2, width: 20, x: 0, y: 0 },
      { height: 3, width: 20, x: 0, y: 3 },
      { height: 1, width: 20, x: 0, y: 7 },
    ]);
  });

  it('lays out horizontal items and centers them on the cross axis', () => {
    expect(
      calculateStackLayout({
        align: 'center',
        direction: 'horizontal',
        gap: 2,
        height: 8,
        items: [
          { height: 2, width: 4 },
          { height: 4, width: 6 },
        ],
        width: 20,
      }),
    ).toEqual([
      { height: 2, width: 4, x: 0, y: 3 },
      { height: 4, width: 6, x: 6, y: 2 },
    ]);
  });
});
