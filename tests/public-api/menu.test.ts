import { describe, expect, it } from 'vitest';

import { renderMenu } from '@/index.js';

describe('Menu', () => {
  it('renders cursor, disabled state, shortcuts, width, and viewport', () => {
    expect(
      renderMenu({
        activeId: 'deploy',
        height: 3,
        items: [
          { id: 'build', label: 'Build package', shortcut: 'b' },
          { id: 'deploy', label: '{bold}Deploy{/bold}', shortcut: 'd' },
          { disabled: true, id: 'rollback', label: 'Rollback', shortcut: 'r' },
        ],
        width: 20,
      }),
    ).toBe('    Build package  b\n›   Deploy         d\n  × Rollback       r');
  });

  it('renders a cell-aware empty state without mutating items', () => {
    const items = [] as const;

    expect(renderMenu({ emptyText: '没有操作', height: 2, items, width: 5 })).toBe('没有…');
    expect(items).toEqual([]);
  });

  it('rejects invalid dimensions, ids, labels, and shortcuts', () => {
    expect(() => renderMenu({ height: 1, items: [], width: -1 })).toThrow(RangeError);
    expect(() => renderMenu({ height: 1, items: [{ id: '', label: 'Bad' }], width: 8 })).toThrow(
      RangeError,
    );
    expect(() => renderMenu({ height: 1, items: [{ id: 'bad', label: '' }], width: 8 })).toThrow(
      RangeError,
    );
    expect(() =>
      renderMenu({ height: 1, items: [{ id: 'bad', label: 'Bad', shortcut: '' }], width: 8 }),
    ).toThrow(RangeError);
  });
});
