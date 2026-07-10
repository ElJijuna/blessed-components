import { describe, expect, it } from 'vitest';

import { renderPerformancePanel } from '@/index.js';

describe('PerformancePanel', () => {
  it('renders runtime counters', () => {
    expect(
      renderPerformancePanel({ eventLoopDelayMs: 2, fps: 60, memory: '42 MB', renderMs: 4 }),
    ).toBe(['fps: 60', 'render: 4ms', 'event loop: 2ms', 'memory: 42 MB'].join('\n'));
  });
});
