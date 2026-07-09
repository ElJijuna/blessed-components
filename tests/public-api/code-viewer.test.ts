import { describe, expect, it } from 'vitest';

import { renderCodeViewer } from '@/index.js';

describe('CodeViewer', () => {
  it('renders language header and line numbers with sanitized code', () => {
    expect(
      renderCodeViewer({
        code: 'const x = {bold}1{/bold};',
        firstLine: 9,
        language: 'ts',
      }),
    ).toBe(['[ts]', '9 | const x = 1;'].join('\n'));
  });
});
