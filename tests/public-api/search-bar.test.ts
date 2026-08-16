import { describe, expect, it, vi } from 'vitest';

import { createSearchBarState, renderSearchBar, SEARCH_BAR_ASCII_CHARACTERS } from '@/index.js';

describe('SearchBar', () => {
  const scopes = [
    { id: 'all', label: 'All' },
    { id: 'code', label: 'Code' },
  ] as const;

  it('renders scope, query, result count, clear, and submit controls', () => {
    expect(
      renderSearchBar({
        activeTarget: 'scope',
        characters: SEARCH_BAR_ASCII_CHARACTERS,
        query: 'api',
        resultCount: 1,
        scopeId: 'code',
        scopes,
        width: 80,
      }),
    ).toBe('>[Code]< | / api | 1 result | x | Search');

    expect(
      renderSearchBar({
        activeTarget: 'query',
        placeholder: 'service name',
        resultCount: 12,
        scopes,
        width: 80,
      }),
    ).toBe('[All] │ ▸/ service name◂ │ 12 results │ Search');
  });

  it('manages uncontrolled query, scope, clear, and submission contracts', () => {
    const onClear = vi.fn();
    const onQueryChange = vi.fn();
    const onScopeChange = vi.fn();
    const onSubmit = vi.fn();
    const state = createSearchBarState({
      defaultQuery: 'api',
      defaultScopeId: 'all',
      onClear,
      onQueryChange,
      onScopeChange,
      onSubmit,
      scopes,
    });

    expect(state.query()).toBe('api');
    expect(state.activeScope()?.id).toBe('all');
    expect(state.nextScope()?.id).toBe('code');
    expect(onScopeChange).toHaveBeenCalledWith('code');
    expect(state.setQuery('worker')).toBe(true);
    expect(state.submit()).toBe(true);
    expect(onSubmit).toHaveBeenCalledWith({
      query: 'worker',
      scope: { id: 'code', label: 'Code' },
    });
    expect(state.clear()).toBe(true);
    expect(state.query()).toBe('');
    expect(onQueryChange).toHaveBeenLastCalledWith('');
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('supports controlled state and blocks interaction while disabled', () => {
    const onQueryChange = vi.fn();
    const onScopeChange = vi.fn();
    const state = createSearchBarState({
      onQueryChange,
      onScopeChange,
      query: 'api',
      scopeId: 'all',
      scopes,
    });

    state.setQuery('worker');
    state.setScope('code');

    expect(state.query()).toBe('api');
    expect(state.activeScope()?.id).toBe('all');
    expect(onQueryChange).toHaveBeenCalledWith('worker');
    expect(onScopeChange).toHaveBeenCalledWith('code');

    state.setOptions({ disabled: true, query: 'locked', scopeId: 'code', scopes });

    expect(state.setQuery('open')).toBe(false);
    expect(state.setScope('all')).toBe(false);
    expect(state.clear()).toBe(false);
    expect(state.submit()).toBe(false);
  });

  it('sanitizes output, truncates narrow layouts, and validates data', () => {
    const rendered = renderSearchBar({
      characters: SEARCH_BAR_ASCII_CHARACTERS,
      query: '{bold}api{/bold}',
      scopes: [{ id: 'all', label: '\u001b[31mAll\u001b[0m' }],
      width: 16,
    });

    expect(rendered).not.toContain('{bold}');
    expect(rendered).not.toContain('\u001b[');
    expect(rendered.length).toBeLessThanOrEqual(16);
    expect(() => renderSearchBar({ resultCount: -1, width: 10 })).toThrow(RangeError);
    expect(() => renderSearchBar({ width: -1 })).toThrow(RangeError);
    expect(() =>
      createSearchBarState({
        scopes: [
          { id: 'same', label: 'One' },
          { id: 'same', label: 'Two' },
        ],
      }),
    ).toThrow(RangeError);
    expect(() => createSearchBarState({ defaultScopeId: 'missing', scopes })).toThrow(RangeError);
  });
});
