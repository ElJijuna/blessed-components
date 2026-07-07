import { describe, expect, it } from 'vitest';

import { flattenTreeRows, renderTree } from '@/index.js';

describe('Tree', () => {
  const nodes = [
    {
      children: [
        { id: 'src/components', label: 'components' },
        { disabled: true, id: 'src/generated', label: 'generated' },
      ],
      id: 'src',
      label: 'src',
    },
    { id: 'README', label: 'README.md' },
  ] as const;

  it('flattens only expanded branches without mutating nodes', () => {
    const rows = flattenTreeRows({
      expandedIds: new Set(['src']),
      nodes,
    });

    expect(rows.map((row) => [row.depth, row.node.id, row.expandable, row.expanded])).toEqual([
      [0, 'src', true, true],
      [1, 'src/components', false, false],
      [1, 'src/generated', false, false],
      [0, 'README', false, false],
    ]);
    expect(nodes[0].children).toHaveLength(2);
  });

  it('renders active, selected, disabled, expanded, collapsed, width, and viewport state', () => {
    expect(
      renderTree({
        activeId: 'src/components',
        expandedIds: new Set(['src']),
        height: 3,
        nodes,
        selectedId: 'src/components',
        width: 17,
      }),
    ).toBe('    ▾ src\n  › ●   componen…\n    ×   generated');
  });

  it('renders a cell-aware empty state', () => {
    expect(
      renderTree({
        emptyText: '没有节点',
        height: 3,
        nodes: [],
        width: 5,
      }),
    ).toBe('没有…');
  });
});
