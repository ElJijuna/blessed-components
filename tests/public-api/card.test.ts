import { describe, expect, it } from 'vitest';

import { renderCardRegion } from '@/index.js';

describe('Card', () => {
  it('renders safe, bounded text for an independent region', () => {
    expect(
      renderCardRegion({
        content: '\u001B[31m{red-fg}Deployment{/red-fg}\u001B[0m',
        overflow: 'truncate',
        width: 8,
      }),
    ).toBe('Deploym…');
  });

  it('supports empty structural regions', () => {
    expect(renderCardRegion()).toBe('');
  });
});
