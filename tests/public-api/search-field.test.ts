import { describe, expect, it } from 'vitest';

import { renderSearchField } from '@/index.js';

describe('SearchField', () => {
  it('renders label, placeholder, and hint', () => {
    expect(
      renderSearchField({
        hint: 'Press Enter to search',
        label: 'Filter',
        placeholder: 'service name',
        query: '',
        width: 24,
      }),
    ).toBe('Filter:\n/ service name\n? Press Enter to search');
  });

  it('renders focused query, clear affordance, and error', () => {
    expect(
      renderSearchField({
        error: 'Too many wildcards',
        focused: true,
        label: 'Filter',
        query: 'api*',
        width: 18,
      }),
    ).toBe('Filter:\n› / api* x\n! Too many wildca…');
  });

  it('sanitizes markup and rejects invalid input', () => {
    expect(
      renderSearchField({
        label: '{bold}Filter{/bold}',
        query: '{red-fg}api{/red-fg}',
        width: 16,
      }),
    ).toBe('Filter:\n/ api x');

    expect(() => renderSearchField({ label: 'Filter', query: 'api\nweb', width: 12 })).toThrow(
      RangeError,
    );
    expect(() => renderSearchField({ label: 'Filter', width: -1 })).toThrow(RangeError);
  });
});
