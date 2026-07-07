import { describe, expect, it } from 'vitest';

import type { DropdownMenuItem, MenuItem } from '@/index.js';
import { renderDropdownMenu } from '@/index.js';

describe('DropdownMenu', () => {
  const items: readonly DropdownMenuItem<MenuItem>[] = [
    {
      id: 'file',
      items: [
        { id: 'new', label: 'New', shortcut: 'n' },
        { id: 'open', label: 'Open', shortcut: 'o' },
      ],
      label: 'File',
    },
    {
      id: 'view',
      items: [
        { id: 'logs', label: 'Logs' },
        { disabled: true, id: 'debug', label: 'Debug' },
      ],
      label: 'View',
    },
  ] as const;

  it('renders menu bar plus open dropdown actions', () => {
    expect(
      renderDropdownMenu({
        activeItemId: 'open',
        focusedId: 'file',
        height: 4,
        items,
        openId: 'file',
        width: 24,
      }),
    ).toBe('›● File     View\n    New                n\n›   Open               o');
  });

  it('renders closed and empty states', () => {
    expect(
      renderDropdownMenu({
        focusedId: 'view',
        height: 4,
        items,
        width: 14,
      }),
    ).toBe('   File  ›  V…');

    expect(
      renderDropdownMenu({
        height: 4,
        items: [],
        width: 8,
      }),
    ).toBe('No menus');
  });
});
