import { describe, expect, it } from 'vitest';
import { calculateDetailsPanelLayout } from '@/index.js';

describe('DetailsPanel', () => {
  it('lays out master and detail side by side', () => {
    expect(
      calculateDetailsPanelLayout({
        gap: 1,
        height: 10,
        masterWidth: 20,
        selected: true,
        width: 70,
      }),
    ).toEqual({
      detail: { height: 10, width: 49, x: 21, y: 0 },
      detailVisible: true,
      master: { height: 10, width: 20, x: 0, y: 0 },
      masterVisible: true,
      mode: 'side-by-side',
    });
  });
  it('switches narrow layouts between master and detail', () => {
    expect(calculateDetailsPanelLayout({ height: 8, width: 40 }).mode).toBe('master-only');
    const selected = calculateDetailsPanelLayout({ height: 8, selected: true, width: 40 });

    expect(selected.mode).toBe('detail-only');
    expect(selected.detail.width).toBe(40);
    expect(selected.masterVisible).toBe(false);
  });
  it('validates dimensions', () => {
    expect(() => calculateDetailsPanelLayout({ height: 8, width: -1 })).toThrow(RangeError);
    expect(() => calculateDetailsPanelLayout({ collapseBelow: 1.5, height: 8, width: 40 })).toThrow(
      RangeError,
    );
  });
});
