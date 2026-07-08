import { describe, expect, it } from 'vitest';

import { renderBulletChart } from '@/index.js';

describe('BulletChart', () => {
  it('renders value against target and qualitative ranges', () => {
    expect(
      renderBulletChart({
        label: 'CPU',
        ranges: [{ end: 50, start: 0 }],
        target: 80,
        value: 60,
        width: 10,
      }),
    ).toBe('CPU [██████ |  ] 60');
  });
});
