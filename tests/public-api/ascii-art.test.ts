import { describe, expect, it } from 'vitest';

import { renderAsciiArt } from '@/index.js';

describe('AsciiArt', () => {
  it('renders aligned and cropped art', () => {
    expect(
      renderAsciiArt({
        align: 'center',
        art: 'hi\nthere',
        height: 2,
        width: 6,
      }),
    ).toBe('  hi\nthere');
  });
});
