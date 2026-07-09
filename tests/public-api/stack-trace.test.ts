import { describe, expect, it } from 'vitest';

import { renderStackTrace } from '@/index.js';

describe('StackTrace', () => {
  it('renders frame order with locations', () => {
    expect(
      renderStackTrace({
        error: 'TypeError: boom',
        frames: [{ column: 7, file: 'src/app.ts', functionName: 'run', line: 12 }],
      }),
    ).toBe(['TypeError: boom', '1. run (src/app.ts:12:7)'].join('\n'));
  });
});
