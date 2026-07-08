import { describe, expect, it } from 'vitest';

import { filterComboboxItems, renderCombobox } from '@/index.js';

describe('Combobox', () => {
  it('filters and renders suggestions with active and selected state', () => {
    const items = [
      { id: 'js', label: 'JavaScript' },
      { id: 'ts', label: 'TypeScript' },
    ];

    expect(filterComboboxItems(items, 'type').map(({ id }) => id)).toEqual(['ts']);
    expect(
      renderCombobox({
        activeId: 'ts',
        height: 3,
        items,
        open: true,
        query: 'type',
        value: 'ts',
        width: 40,
      }),
    ).toBe('▾ type\n› ● TypeScript');
  });
});
