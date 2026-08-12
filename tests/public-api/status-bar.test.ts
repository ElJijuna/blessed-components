import { describe, expect, it } from 'vitest';

import { renderStatusBar, STATUS_BAR_ASCII_CHARACTERS, type StatusBarItem } from '@/index.js';

describe('StatusBar', () => {
  it('renders left, center, and right sections in one padded line', () => {
    const output = renderStatusBar({
      items: [
        { label: 'NORMAL' },
        { label: 'main', marker: '●', section: 'center' },
        { detail: '3 jobs', label: 'Ready', section: 'right' },
      ],
      width: 48,
    });

    expect(output).toHaveLength(48);
    expect(output).toContain('NORMAL');
    expect(output).toContain('● main');
    expect(output).toContain('Ready: 3 jobs');
  });

  it('renders message text after left items', () => {
    expect(
      renderStatusBar({
        characters: STATUS_BAR_ASCII_CHARACTERS,
        items: [{ label: 'NORMAL' }],
        message: 'Ready',
        pad: false,
        width: 24,
      }),
    ).toBe('NORMAL | Ready');
  });

  it('truncates to the available width', () => {
    expect(
      renderStatusBar({
        items: [
          { label: 'very-long-mode-name' },
          { label: 'right-side-is-more-important', section: 'right' },
        ],
        width: 20,
      }),
    ).toHaveLength(20);
  });

  it('sanitizes terminal markup and omits empty labels', () => {
    const items: StatusBarItem[] = [
      { label: '   ' },
      { detail: '\u001B[31m{red-fg}online{/red-fg}\u001B[0m', label: '{bold}API{/bold}' },
    ];

    expect(
      renderStatusBar({
        items,
        pad: false,
        width: 24,
      }),
    ).toBe('API: online');
  });

  it('rejects invalid widths and wide markers', () => {
    expect(() => renderStatusBar({ width: -1 })).toThrow(RangeError);
    expect(() =>
      renderStatusBar({
        items: [{ label: 'Ready', marker: 'OK' }],
        width: 20,
      }),
    ).toThrow(RangeError);
  });
});
