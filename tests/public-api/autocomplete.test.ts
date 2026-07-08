import { describe, expect, it } from 'vitest';

import { filterAutocompleteItems, renderAutocomplete } from '@/index.js';

describe('Autocomplete', () => {
  it('filters and renders suggestions', () => {
    const items = [
      { id: 'js', label: 'JavaScript' },
      { id: 'ts', label: 'TypeScript' },
    ];

    expect(filterAutocompleteItems(items, 'type').map(({ id }) => id)).toEqual(['ts']);
    expect(
      renderAutocomplete({
        activeId: 'ts',
        height: 3,
        items,
        query: 'type',
        width: 30,
      }),
    ).toBe('> type\n› TypeScript');
  });
});
