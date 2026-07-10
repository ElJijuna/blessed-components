import { describe, expect, it } from 'vitest';

import { clampResizableSize, renderResizable } from '@/index.js';

describe('Resizable', () => {
  it('clamps and renders bounded size', () => {
    expect(clampResizableSize({ max: 40, min: 10, size: 50 })).toBe(40);
    expect(renderResizable({ label: 'sidebar', max: 40, min: 10, size: 50 })).toBe(
      'sidebar: 40 cols (min 10, max 40)',
    );
  });
});
