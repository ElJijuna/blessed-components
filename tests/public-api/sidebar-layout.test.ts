import { describe, expect, it } from 'vitest';

import { calculateSidebarLayout } from '@/index.js';

describe('SidebarLayout', () => {
  it('calculates sidebar and main regions', () => {
    expect(
      calculateSidebarLayout({
        gap: 1,
        height: 10,
        sidebarWidth: 20,
        width: 60,
      }),
    ).toEqual({
      collapsed: false,
      main: { height: 10, width: 39, x: 21, y: 0 },
      sidebar: { height: 10, width: 20, x: 0, y: 0 },
      sidebarVisible: true,
    });
  });

  it('collapses explicitly and by threshold', () => {
    expect(calculateSidebarLayout({ collapsed: true, height: 8, width: 40 })).toEqual({
      collapsed: true,
      main: { height: 8, width: 40, x: 0, y: 0 },
      sidebar: { height: 8, width: 0, x: 0, y: 0 },
      sidebarVisible: false,
    });
    expect(calculateSidebarLayout({ collapseBelow: 50, height: 8, width: 40 }).collapsed).toBe(
      true,
    );
  });

  it('collapses when main width would be too small', () => {
    expect(
      calculateSidebarLayout({
        height: 8,
        minMainWidth: 20,
        sidebarWidth: 30,
        width: 40,
      }).collapsed,
    ).toBe(true);
  });

  it('rejects invalid dimensions', () => {
    expect(() => calculateSidebarLayout({ height: 8, sidebarWidth: -1, width: 40 })).toThrow(
      RangeError,
    );
    expect(() => calculateSidebarLayout({ gap: 1.5, height: 8, width: 40 })).toThrow(RangeError);
  });
});
