import { describe, expect, it } from 'vitest';

import { renderCommitList } from '@/index.js';

describe('CommitList', () => {
  it('renders short hashes, refs, message, and author', () => {
    expect(
      renderCommitList({
        commits: [{ author: 'Ada', hash: 'abcdef123456', message: 'Add renderer', refs: ['HEAD'] }],
      }),
    ).toBe('abcdef1 (HEAD) Add renderer - Ada');
  });
});
