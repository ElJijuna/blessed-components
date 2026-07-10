import { describe, expect, it } from 'vitest';

import { renderVirtualTable } from '@/index.js';

describe('VirtualTable', () => {
  it('renders only the visible row window', () => {
    expect(
      renderVirtualTable({
        columns: [{ key: 'name' }, { header: 'CPU', key: 'cpu' }],
        rowCount: 1,
        rows: [
          { cpu: '3%', name: 'web' },
          { cpu: '8%', name: 'api' },
        ],
        start: 1,
      }),
    ).toBe(['name | CPU', 'api  | 8% '].join('\n'));
  });
});
