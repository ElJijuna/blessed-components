import { describe, expect, it } from 'vitest';

import { renderDiffViewer } from '@/index.js';

describe('DiffViewer', () => {
  it('renders unified diff markers and title', () => {
    expect(
      renderDiffViewer({
        lines: [
          { kind: 'remove', text: 'old' },
          { kind: 'add', text: '{green-fg}new{/green-fg}' },
        ],
        title: '@@ file @@',
      }),
    ).toBe(['@@ file @@', '- old', '+ new'].join('\n'));
  });
});
