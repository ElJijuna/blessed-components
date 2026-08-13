import { describe, expect, it } from 'vitest';
import {
  filterWorkspaceSwitcherItems,
  renderWorkspaceSwitcher,
  renderWorkspaceSwitcherModel,
  WORKSPACE_SWITCHER_ASCII_CHARACTERS,
} from '@/index.js';

describe('WorkspaceSwitcher', () => {
  const items = [
    { environment: 'prod', id: 'payments', label: 'Payments', status: 'online' },
    { environment: 'staging', id: 'search', label: 'Search', status: 'degraded' },
    { disabled: true, environment: 'dev', id: 'archive', label: 'Archive' },
  ] as const;

  it('renders active, selected, disabled, and metadata', () => {
    expect(
      renderWorkspaceSwitcher({
        activeId: 'search',
        characters: WORKSPACE_SWITCHER_ASCII_CHARACTERS,
        items,
        value: 'payments',
      }),
    ).toBe('  * Payments · prod · online\n>   Search · staging · degraded\n  x Archive · dev');
  });
  it('filters workspace metadata', () => {
    expect(filterWorkspaceSwitcherItems(items, 'degrad').map(({ id }) => id)).toEqual(['search']);
  });
  it('clips and reports visible ids', () => {
    expect(renderWorkspaceSwitcherModel({ height: 1, items, query: 'prod' })).toEqual({
      content: '    Payments · prod · online',
      visibleItemIds: ['payments'],
    });
  });
  it('validates input', () => {
    expect(() => renderWorkspaceSwitcher({ items, width: -1 })).toThrow(RangeError);
    expect(() => renderWorkspaceSwitcher({ items: [{ id: '', label: 'Bad' }] })).toThrow(
      RangeError,
    );
  });
});
