import { describe, expect, it } from 'vitest';

import { renderImage } from '@/index.js';

describe('Image', () => {
  it('renders alt text and source fallback', () => {
    expect(renderImage({ alt: 'Logo', source: 'logo.png' })).toBe(
      ['image: Logo', 'source: logo.png'].join('\n'),
    );
  });
});
