import { describe, expect, it } from 'vitest';

import { renderWaterfallChart } from '@/index.js';

describe('WaterfallChart', () => {
  it('renders signed contributions and totals', () => {
    expect(renderWaterfallChart({ start: 10, steps: [{ label: 'cost', value: -3 }] })).toBe(
      ['start 10', 'cost  -3 -> 7'].join('\n'),
    );
  });
});
