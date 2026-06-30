import { describe, expect, it } from 'vitest';

import { computeVirtualListWindow, renderVirtualList } from '@/index.js';

describe('VirtualList', () => {
  it('computes a bounded source window with overscan metadata', () => {
    const items = Array.from({ length: 100 }, (_, index) => ({
      id: String(index),
      label: `Item ${index}`,
    }));

    expect(
      computeVirtualListWindow({
        height: 3,
        items,
        offset: 50,
        overscan: 2,
      }),
    ).toEqual({
      afterCount: 45,
      beforeCount: 48,
      endIndex: 55,
      items: items.slice(48, 55),
      offset: 50,
      startIndex: 48,
      viewportOffset: 2,
    });
  });

  it('renders only the visible viewport from the virtual window', () => {
    const items = Array.from({ length: 20 }, (_, index) => ({
      id: String(index),
      label: `Item ${index}`,
    }));

    expect(
      renderVirtualList({
        activeId: '11',
        height: 3,
        items,
        offset: 10,
        overscan: 2,
        selectedId: '12',
        width: 14,
      }),
    ).toBe('    Item 10\n›   Item 11\n  ● Item 12');
  });

  it('clamps offsets and validates dimensions', () => {
    expect(
      renderVirtualList({
        height: 2,
        items: [
          { id: 'one', label: 'One' },
          { id: 'two', label: 'Two' },
        ],
        offset: 99,
        width: 12,
      }),
    ).toBe('    One\n    Two');
    expect(() =>
      computeVirtualListWindow({
        height: 2,
        items: [],
        overscan: -1,
      }),
    ).toThrow(RangeError);
    expect(() =>
      renderVirtualList({
        height: 2,
        items: [],
        width: -1,
      }),
    ).toThrow(RangeError);
  });
});
