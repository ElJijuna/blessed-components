import { describe, expect, it } from 'vitest';

import { renderProcessRunner } from '@/index.js';

describe('ProcessRunner', () => {
  it('renders command state and output', () => {
    expect(
      renderProcessRunner({ command: 'npm test', output: ['vitest'], status: 'running' }),
    ).toBe(['$ npm test', 'running', 'vitest'].join('\n'));
  });
});
