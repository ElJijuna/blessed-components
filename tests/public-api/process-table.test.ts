import { describe, expect, it } from 'vitest';

import { renderProcessTable } from '@/index.js';

describe('ProcessTable', () => {
  it('renders multiple process states', () => {
    expect(
      renderProcessTable({
        processes: [{ command: 'node server', name: 'api', status: 'running' }],
      }),
    ).toBe(
      ['NAME       STATUS   EXIT   COMMAND', 'api        running  -      node server'].join('\n'),
    );
  });
});
