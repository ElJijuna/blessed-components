import { describe, expect, it } from 'vitest';

import { renderFileTree } from '@/index.js';

describe('FileTree', () => {
  it('renders expanded file rows with kind and git-state markers', () => {
    expect(
      renderFileTree({
        expandedIds: new Set(['src']),
        height: 3,
        nodes: [
          {
            children: [
              { gitStatus: 'modified', id: 'src/index.ts', kind: 'file', label: 'index.ts' },
            ],
            id: 'src',
            kind: 'directory',
            label: 'src',
          },
        ],
        width: 40,
      }),
    ).toBe('    ▾ d   src\n        f M index.ts');
  });
});
