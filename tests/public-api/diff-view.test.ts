import { describe, expect, it } from 'vitest';

import { renderDiffView } from '@/index.js';

describe('DiffView', () => {
  const lines = [
    { content: '@@ -1,3 +1,3 @@', type: 'hunk' },
    { content: 'const status = "queued";', oldLine: 1, type: 'remove' },
    { content: 'const status = "running";', newLine: 1, type: 'add' },
    { content: '{bold}export{/bold} { status };', newLine: 2, oldLine: 2, type: 'context' },
  ] as const;

  it('renders bounded unified diff rows with line numbers and truncation', () => {
    expect(
      renderDiffView({
        height: 3,
        lines,
        offset: 1,
        width: 22,
      }),
    ).toBe('1   - const status = …\n  1 + const status = …\n2 2   export { status…');
  });

  it('can hide line numbers and sanitizes dynamic content', () => {
    expect(
      renderDiffView({
        height: 2,
        lines: [
          { content: '\u001B[32madded\u001B[0m', newLine: 1, type: 'add' },
          { content: '{red-fg}removed{/red-fg}', oldLine: 1, type: 'remove' },
        ],
        showLineNumbers: false,
        width: 12,
      }),
    ).toBe('+ added\n- removed');
  });

  it('renders empty state and validates dimensions', () => {
    expect(
      renderDiffView({
        emptyText: 'No changes',
        height: 3,
        lines: [],
        width: 6,
      }),
    ).toBe('No ch…');

    expect(() =>
      renderDiffView({
        height: 1,
        lineNumberWidth: 0,
        lines,
        width: 20,
      }),
    ).toThrow(RangeError);
  });
});
