import { describe, expect, it } from 'vitest';

import { renderDivider } from '@/index.js';

describe('Divider', () => {
  it('renders a fixed-width horizontal separator', () => {
    expect(renderDivider({ length: 8 })).toBe('────────');
  });

  it('embeds a safe centered label while preserving total cell width', () => {
    expect(
      renderDivider({
        label: '\u001B[31m{red-fg}状态{/red-fg}\u001B[0m',
        length: 12,
      }),
    ).toBe('─── 状态 ───');
  });

  it('supports vertical and ASCII separators', () => {
    expect(
      renderDivider({
        characters: { horizontal: '-', vertical: '|' },
        length: 3,
        orientation: 'vertical',
      }),
    ).toBe('|\n|\n|');
  });
});
