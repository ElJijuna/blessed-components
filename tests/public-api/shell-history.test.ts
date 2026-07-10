import { describe, expect, it } from 'vitest';

import { renderShellHistory } from '@/index.js';

describe('ShellHistory', () => {
  it('filters commands by query', () => {
    expect(
      renderShellHistory({
        activeId: '2',
        items: [
          { command: 'npm test', id: '1' },
          { command: 'git status', id: '2' },
        ],
        query: 'git',
      }),
    ).toBe(['query: git', '> git status'].join('\n'));
  });
});
