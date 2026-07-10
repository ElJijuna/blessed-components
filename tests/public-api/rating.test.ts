import { describe, expect, it } from 'vitest';

import { renderRating } from '@/index.js';

describe('Rating', () => {
  it('renders glyphs with numeric fallback', () => {
    expect(renderRating({ max: 5, value: 4 })).toBe('****- 4/5');
  });
});
