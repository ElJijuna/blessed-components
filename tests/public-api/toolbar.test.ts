import { describe, expect, it } from 'vitest';

import { renderToolbar, renderToolbarModel, TOOLBAR_ASCII_CHARACTERS } from '@/index.js';

describe('Toolbar', () => {
  const items = [
    { icon: '+', id: 'create', label: 'Create', shortcut: 'N' },
    { icon: '↻', id: 'refresh', label: 'Refresh', separator: true, shortcut: 'R' },
    { disabled: true, icon: '×', id: 'delete', label: 'Delete' },
  ] as const;

  it('renders grouped commands, shortcuts, selection, and disabled state', () => {
    expect(renderToolbar({ activeId: 'create', items, width: 80 })).toBe(
      '▸+ Create [N]◂ │ ↻ Refresh [R]  (× Delete)',
    );
  });

  it('supports dense ASCII output', () => {
    expect(
      renderToolbar({
        activeId: 'refresh',
        characters: TOOLBAR_ASCII_CHARACTERS,
        dense: true,
        items,
        width: 30,
      }),
    ).toBe('+ | >↻<  (×)');
  });

  it('shows overflow and reports visible commands', () => {
    const result = renderToolbarModel({ items, width: 19 });

    expect(result.content).toBe('+ Create [N] …');
    expect(result.visibleItemIds).toEqual(['create']);
  });

  it('sanitizes dynamic text and validates data', () => {
    expect(
      renderToolbar({
        items: [{ icon: '{bold}+{/bold}', id: 'new', label: '\u001B[31mNew\u001B[0m' }],
        width: 20,
      }),
    ).toBe('+ New');
    expect(() => renderToolbar({ items, width: -1 })).toThrow(RangeError);
    expect(() =>
      renderToolbar({ items: [{ icon: '', id: 'bad', label: 'Bad' }], width: 10 }),
    ).toThrow(RangeError);
  });
});
