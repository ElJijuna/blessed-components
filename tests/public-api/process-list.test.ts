import { describe, expect, it } from 'vitest';

import { renderProcessList } from '@/index.js';

describe('ProcessList', () => {
  it('renders process rows', () => {
    expect(
      renderProcessList({
        processes: [{ command: 'node', cpu: 7, memory: '32 MB', pid: 42, status: 'run' }],
      }),
    ).toBe(
      ['PID   CPU   MEM     STATUS   COMMAND', '42    7%    32 MB   run      node'].join('\n'),
    );
  });
});
