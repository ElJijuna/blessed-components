import { describe, expect, it } from 'vitest';

import { renderGitStatus } from '@/index.js';

describe('GitStatus', () => {
  it('renders branch and grouped file states', () => {
    expect(
      renderGitStatus({
        branch: 'main',
        files: [
          { path: 'src/app.ts', state: 'modified' },
          { path: 'README.md', state: 'staged' },
        ],
      }),
    ).toBe(['branch: main', 'staged:', '  README.md', 'modified:', '  src/app.ts'].join('\n'));
  });
});
