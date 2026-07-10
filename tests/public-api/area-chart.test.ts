import { describe, expect, it } from 'vitest';

import { renderAreaChart } from '@/index.js';

describe('AreaChart', () => {
  it('renders sampled intensity cells', () => {
    expect(renderAreaChart({ max: 7, min: 0, values: [0, 3, 7], width: 3 })).toBe(' -#');
  });
});
