import { describe, expect, it } from 'vitest';

import { filterLogExplorerEntries, renderLogExplorer } from '@/index.js';

describe('LogExplorer', () => {
  const entries = [
    { id: '1', level: 'info', message: 'Deploy started', source: 'api' },
    { id: '2', level: 'warn', message: 'Queue latency high', source: 'worker' },
    { id: '3', level: 'error', message: '{bold}Deploy failed{/bold}', source: 'api' },
  ] as const;

  it('filters by query, level, and source without mutating entries', () => {
    expect(
      filterLogExplorerEntries({
        entries,
        filter: {
          levels: ['error'],
          query: 'deploy',
          sources: ['api'],
        },
      }),
    ).toEqual([{ id: '3', level: 'error', message: '{bold}Deploy failed{/bold}', source: 'api' }]);
    expect(entries).toHaveLength(3);
  });

  it('renders filtered log rows through the LogViewer row contract', () => {
    expect(
      renderLogExplorer({
        entries,
        filter: { query: 'deploy' },
        height: 2,
        width: 30,
      }),
    ).toBe('│ i [api] Deploy started\n│ ! [api] Deploy failed');
  });

  it('renders distinct empty and no-match states', () => {
    expect(
      renderLogExplorer({
        emptyText: 'Nothing captured',
        entries: [],
        height: 2,
        width: 9,
      }),
    ).toBe('Nothing …');

    expect(
      renderLogExplorer({
        entries,
        filter: { query: 'database' },
        height: 2,
        noMatchesText: 'No matches',
        width: 20,
      }),
    ).toBe('No matches');
  });
});
