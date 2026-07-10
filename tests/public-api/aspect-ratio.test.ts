import { describe, expect, it } from 'vitest';

import { calculateAspectRatioSize, renderAspectRatio } from '@/index.js';

describe('AspectRatio', () => {
  it('calculates and renders preserved dimensions', () => {
    expect(calculateAspectRatioSize({ ratioHeight: 9, ratioWidth: 16, width: 32 })).toEqual({
      height: 18,
      width: 32,
    });
    expect(renderAspectRatio({ ratioHeight: 9, ratioWidth: 16, width: 32 })).toBe('32x18 (16:9)');
  });
});
