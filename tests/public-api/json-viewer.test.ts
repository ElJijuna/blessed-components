import { describe, expect, it } from 'vitest';

import { renderJsonViewer } from '@/index.js';

describe('JsonViewer', () => {
  it('renders expanded JSON object paths', () => {
    expect(
      renderJsonViewer({
        expandedPaths: new Set(['$', '$.user']),
        height: 4,
        value: { user: { name: 'Ada' } },
        width: 40,
      }),
    ).toBe('▾ $ Object(1)\n  ▾ user Object(1)\n      name: "Ada"');
  });
});
