import { describe, expect, it } from 'vitest';

import { renderInspector } from '@/index.js';

describe('Inspector', () => {
  it('renders object rows with key, type, and preview value', () => {
    expect(
      renderInspector({
        expandedPaths: new Set(['$']),
        height: 3,
        value: { ok: true },
        width: 40,
      }),
    ).toBe('$ <object> 1 field\n  ok <boolean> true');
  });
});
