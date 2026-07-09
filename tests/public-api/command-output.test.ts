import { describe, expect, it } from 'vitest';

import { renderCommandOutput } from '@/index.js';

describe('CommandOutput', () => {
  it('renders read-only command status and output', () => {
    expect(
      renderCommandOutput({
        command: 'npm test',
        exitCode: 1,
        output: ['failed'],
        status: 'failed',
      }),
    ).toBe(['$ npm test', 'failed (1)', 'failed'].join('\n'));
  });
});
