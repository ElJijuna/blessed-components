import { describe, expect, it } from 'vitest';

import { createAxisTicks, renderAxis } from '@/index.js';

describe('Axis', () => {
  it('creates and renders evenly spaced ticks', () => {
    expect(createAxisTicks({ max: 10, min: 0, tickCount: 3, width: 11 })).toHaveLength(3);
    expect(renderAxis({ max: 10, min: 0, tickCount: 3, width: 11 })).toBe(
      '┬────┬────┬\n0    5   10',
    );
  });
});
