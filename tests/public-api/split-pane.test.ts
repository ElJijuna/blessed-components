import { describe, expect, it } from 'vitest';

import { renderSplitPane } from '@/index.js';

describe('SplitPane', () => {
  it('renders horizontal region sizes', () => {
    expect(
      renderSplitPane({
        regions: [
          { id: 'main', size: 80 },
          { id: 'logs', size: 32 },
        ],
      }),
    ).toBe('main: 80 cols | logs: 32 cols');
  });
});
