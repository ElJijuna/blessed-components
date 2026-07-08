import { describe, expect, it } from 'vitest';

import { filterCommandPaletteItems, renderCommandPalette } from '@/index.js';

describe('CommandPalette', () => {
  it('filters and renders searchable command rows', () => {
    const commands = [
      { description: 'Open file', id: 'open', label: 'Open' },
      { id: 'close', label: 'Close' },
    ];

    expect(filterCommandPaletteItems(commands, 'file').map(({ id }) => id)).toEqual(['open']);
    expect(
      renderCommandPalette({
        activeId: 'open',
        height: 3,
        items: commands,
        query: 'o',
        width: 40,
      }),
    ).toBe('> o\n› Open - Open file\n  Close');
  });
});
