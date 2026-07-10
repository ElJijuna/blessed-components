import { describe, expect, it } from 'vitest';

import { renderRequestInspector } from '@/index.js';

describe('RequestInspector', () => {
  it('renders method, url, status, headers, and body', () => {
    expect(
      renderRequestInspector({
        body: '{"ok":true}',
        headers: [{ name: 'content-type', value: 'application/json' }],
        method: 'get',
        status: 200,
        url: '/health',
      }),
    ).toBe(['GET /health -> 200', 'content-type: application/json', '', '{"ok":true}'].join('\n'));
  });
});
