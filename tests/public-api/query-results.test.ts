import { describe, expect, it } from 'vitest';

import { renderQueryResults } from '@/index.js';

describe('QueryResults', () => {
  it('renders execution metadata and rows', () => {
    expect(
      renderQueryResults({
        columns: [{ key: 'id' }, { key: 'name' }],
        durationMs: 12,
        rows: [{ id: 1, name: 'ada' }],
      }),
    ).toBe(['rows: 1 (12ms)', 'id | name', '1  | ada '].join('\n'));
  });
});
