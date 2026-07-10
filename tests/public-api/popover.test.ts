import { describe, expect, it } from 'vitest';

import { renderPopover } from '@/index.js';

describe('Popover', () => {
  it('renders side, title, and content', () => {
    expect(renderPopover({ content: ['owner: cli'], side: 'right', title: 'Details' })).toBe(
      ['popover:right Details', 'owner: cli'].join('\n'),
    );
  });
});
