import { describe, expect, it } from 'vitest';

import { renderMutedText } from '@/index.js';

describe('MutedText', () => {
  it('sanitizes terminal markup and wraps by visible terminal cells', () => {
    expect(
      renderMutedText({
        content: '\u001B[31m{bold}Updated{/bold}\u001B[0m 2 minutes ago',
        overflow: 'wrap',
        width: 10,
      }),
    ).toBe('Updated 2 \nminutes ag\no');
  });

  it('supports truncation and alignment through Text options', () => {
    expect(
      renderMutedText({
        align: 'right',
        content: 'queued',
        overflow: 'truncate',
        width: 10,
      }),
    ).toBe('    queued');
  });

  it('propagates Text dimension validation', () => {
    expect(() =>
      renderMutedText({
        content: 'Nope',
        width: -1,
      }),
    ).toThrow(RangeError);
  });
});
