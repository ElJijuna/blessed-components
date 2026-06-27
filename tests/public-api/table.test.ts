import { describe, expect, it } from 'vitest';

import { renderTable } from '@/index.js';

describe('Table', () => {
  it('renders headers, alignment, cursor, selection, disabled rows, width, and viewport', () => {
    expect(
      renderTable({
        activeId: 'two',
        columns: [
          { header: 'Name', id: 'name' },
          { align: 'right', header: 'CPU', id: 'cpu', width: 5 },
        ],
        height: 4,
        offset: 1,
        rows: [
          { cpu: '1%', id: 'one', name: 'api' },
          { cpu: '22%', id: 'two', name: 'worker' },
          { cpu: '100%', disabled: true, id: 'three', name: 'scheduler' },
        ],
        selectedId: 'two',
        width: 20,
      }),
    ).toBe(
      '    Name         CPU\n    ─────────  ─────\n› ● worker       22%\n  × scheduler   100%',
    );
  });

  it('renders a safe empty state without mutating rows', () => {
    const rows = [] as const;

    expect(
      renderTable({
        columns: [{ header: '{bold}服务{/bold}', id: 'service' }],
        emptyText: '没有项目',
        height: 3,
        rows,
        width: 10,
      }),
    ).toBe('    服务  \n    ──────\n    没有…');
    expect(rows).toEqual([]);
  });
});
