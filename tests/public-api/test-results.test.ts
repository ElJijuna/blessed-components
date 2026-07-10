import { describe, expect, it } from 'vitest';

import { renderTestResults } from '@/index.js';

describe('TestResults', () => {
  it('renders summary and test rows', () => {
    expect(
      renderTestResults({
        tests: [
          { durationMs: 4, name: 'renders', status: 'passed', suite: 'core' },
          { message: 'expected true', name: 'validates', status: 'failed' },
        ],
      }),
    ).toBe(
      [
        'passed 1 failed 1 skipped 0',
        'PASS core > renders 4ms',
        'FAIL validates - expected true',
      ].join('\n'),
    );
  });
});
