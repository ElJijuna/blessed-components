import { describe, expect, it } from 'vitest';

import { calculateAppShellLayout } from '@/index.js';

describe('AppShell', () => {
  it('calculates header, sidebar, content, footer, and overlay regions', () => {
    expect(
      calculateAppShellLayout({
        footerHeight: 1,
        gap: 1,
        headerHeight: 1,
        height: 12,
        sidebarWidth: 20,
        width: 60,
      }),
    ).toEqual({
      content: { height: 8, width: 39, x: 21, y: 2 },
      footer: { height: 1, width: 60, x: 0, y: 11 },
      header: { height: 1, width: 60, x: 0, y: 0 },
      overlay: { height: 12, width: 60, x: 0, y: 0 },
      sidebar: { height: 8, width: 20, x: 0, y: 2 },
      sidebarCollapsed: false,
      sidebarVisible: true,
    });
  });

  it('collapses sidebar explicitly and by threshold', () => {
    expect(
      calculateAppShellLayout({
        height: 10,
        sidebarCollapsed: true,
        width: 40,
      }).sidebarVisible,
    ).toBe(false);
    expect(
      calculateAppShellLayout({
        height: 10,
        sidebarCollapseBelow: 50,
        width: 40,
      }).sidebarCollapsed,
    ).toBe(true);
  });

  it('rejects invalid dimensions through composed layout helpers', () => {
    expect(() => calculateAppShellLayout({ height: -1, width: 40 })).toThrow(RangeError);
    expect(() => calculateAppShellLayout({ gap: 1.5, height: 10, width: 40 })).toThrow(RangeError);
  });
});
