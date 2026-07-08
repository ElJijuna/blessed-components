import { describe, expect, it } from 'vitest';

import { renderLink } from '@/index.js';

describe('Link', () => {
  it('renders visible URL text safely', () => {
    expect(
      renderLink({
        label: '{bold}Docs{/bold}',
        url: 'https://example.com/docs',
        width: 40,
      }),
    ).toBe('Docs <https://example.com/docs>');
  });
});
