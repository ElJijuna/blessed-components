import { describe, expect, it } from 'vitest';

import { renderList } from '../../src/index.js';

describe('List', () => {
  it('renders cursor, selection, disabled state, width, and viewport', () => {
    expect(
      renderList({
        activeId: 'two',
        height: 2,
        items: [
          { id: 'one', label: 'First task' },
          { id: 'two', label: 'Second task' },
          { disabled: true, id: 'three', label: 'Unavailable task' },
        ],
        offset: 1,
        selectedId: 'two',
        width: 12,
      }),
    ).toBe('› ● Second …\n  × Unavail…');
  });

  it('renders a cell-aware empty state without mutating items', () => {
    const items = [] as const;

    expect(
      renderList({
        emptyText: '没有项目',
        height: 2,
        items,
        width: 5,
      }),
    ).toBe('没有…');
    expect(items).toEqual([]);
  });
});
