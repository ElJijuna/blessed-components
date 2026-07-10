import { describe, expect, it } from 'vitest';

import { renderBuildStatus } from '@/index.js';

describe('BuildStatus', () => {
  it('renders build status and phases', () => {
    expect(
      renderBuildStatus({
        build: 'release',
        phases: [
          { durationMs: 1200, name: 'test', status: 'success' },
          { name: 'publish', status: 'running' },
        ],
      }),
    ).toBe(['release: running', 'success test 1200ms', 'running publish'].join('\n'));
  });
});
