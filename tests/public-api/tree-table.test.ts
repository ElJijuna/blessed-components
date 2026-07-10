import { describe, expect, it } from 'vitest';

import { renderTreeTable } from '@/index.js';

describe('TreeTable', () => {
  it('renders expanded hierarchy with columns', () => {
    expect(
      renderTreeTable({
        columns: [{ key: 'size' }],
        expandedIds: ['src'],
        rows: [
          {
            children: [{ id: 'app', label: 'app.ts', values: { size: '2 KB' } }],
            id: 'src',
            label: 'src',
            values: { size: '4 KB' },
          },
        ],
      }),
    ).toBe(['Name       | size', '- src      | 4 KB', '    app.ts | 2 KB'].join('\n'));
  });
});
