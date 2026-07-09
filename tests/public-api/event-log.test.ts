import { describe, expect, it } from 'vitest';

import { renderEventLog } from '@/index.js';

describe('EventLog', () => {
  it('renders structured events newest first when requested', () => {
    expect(
      renderEventLog({
        items: [
          { level: 'info', message: 'started', time: '10:00' },
          { level: 'warn', message: 'slow', scope: 'render', time: '10:01' },
        ],
        newestFirst: true,
      }),
    ).toBe(['10:01 WARN [render] slow', '10:00 INFO started'].join('\n'));
  });
});
