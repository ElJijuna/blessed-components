import { describe, expect, it } from 'vitest';

import { renderTooltip } from '@/index.js';

describe('Tooltip', () => {
  it('renders placement metadata and wraps sanitized help text', () => {
    expect(
      renderTooltip({
        message: '{bold}Save changes before deploy{/bold}',
        placement: 'bottom',
        showPlacement: true,
        width: 18,
      }),
    ).toBe(['bottom: Save chang', 'es before deploy'].join('\n'));
  });
});
