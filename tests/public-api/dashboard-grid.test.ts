import { describe, expect, it } from 'vitest';
import { calculateDashboardGridLayout } from '@/index.js';

describe('DashboardGrid', () => {
  it('selects responsive columns and auto-flows spans', () => {
    expect(
      calculateDashboardGridLayout({
        height: 20,
        items: [
          { columnSpan: 2, id: 'health' },
          { id: 'cpu' },
          { id: 'memory' },
          { columnSpan: 3, id: 'logs' },
        ],
        width: 100,
      }),
    ).toEqual({
      columns: 3,
      contentHeight: 17,
      items: [
        { height: 5, id: 'health', width: 67, x: 0, y: 0 },
        { height: 5, id: 'cpu', width: 32, x: 68, y: 0 },
        { height: 5, id: 'memory', width: 33, x: 0, y: 6 },
        { height: 5, id: 'logs', width: 100, x: 0, y: 12 },
      ],
    });
  });
  it('collapses spans to one narrow column', () => {
    const result = calculateDashboardGridLayout({
      height: 12,
      items: [{ columnSpan: 3, id: 'a' }, { id: 'b' }],
      width: 40,
    });

    expect(result.columns).toBe(1);
    expect(result.items[1]).toMatchObject({ width: 40, x: 0, y: 6 });
  });
  it('supports custom breakpoints and minimum heights', () => {
    const result = calculateDashboardGridLayout({
      breakpoints: [{ columns: 2, minWidth: 0 }],
      height: 10,
      items: [{ id: 'a', minHeight: 8 }],
      width: 20,
    });

    expect(result).toMatchObject({
      columns: 2,
      contentHeight: 8,
      items: [{ height: 8, width: 10 }],
    });
  });
  it('validates dimensions and ids', () => {
    expect(() => calculateDashboardGridLayout({ height: 10, items: [], width: -1 })).toThrow(
      RangeError,
    );
    expect(() =>
      calculateDashboardGridLayout({ height: 10, items: [{ id: 'x' }, { id: 'x' }], width: 20 }),
    ).toThrow(RangeError);
  });
});
