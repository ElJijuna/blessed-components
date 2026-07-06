import { describe, expect, it } from 'vitest';

import { renderMenuBar } from '@/components/navigation/menu-bar/index.js';

describe('MenuBar', () => {
  it('renders active, focused, disabled, width, and separators', () => {
    expect(
      renderMenuBar({
        activeId: 'file',
        focusedId: 'view',
        items: [
          { id: 'file', label: '{bold}File{/bold}' },
          { id: 'edit', label: 'Edit' },
          { id: 'view', label: 'View' },
          { disabled: true, id: 'help', label: 'Help' },
        ],
        width: 32,
      }),
    ).toBe(' ● File     Edit  ›  View   × H…');
  });

  it('renders a cell-aware empty state without mutating items', () => {
    const items = [] as const;

    expect(renderMenuBar({ emptyText: '没有菜单', items, width: 5 })).toBe('没有…');
    expect(items).toEqual([]);
  });

  it('rejects invalid width, ids, and labels', () => {
    expect(() => renderMenuBar({ items: [], width: -1 })).toThrow(RangeError);
    expect(() => renderMenuBar({ items: [{ id: '', label: 'Bad' }], width: 8 })).toThrow(
      RangeError,
    );
    expect(() => renderMenuBar({ items: [{ id: 'bad', label: '' }], width: 8 })).toThrow(
      RangeError,
    );
  });
});
