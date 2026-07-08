import { describe, expect, it } from 'vitest';

import { renderColorSwatch } from '@/index.js';

describe('ColorSwatch', () => {
  it('renders label and color value', () => {
    expect(renderColorSwatch({ color: '#3b82f6', label: 'Primary', width: 30 })).toBe(
      '■ Primary #3b82f6',
    );
  });
});
