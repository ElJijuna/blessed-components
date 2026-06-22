import { describe, expect, it } from 'vitest';

import { renderText } from '@/index.js';

describe('Text', () => {
  it('sanitizes terminal markup and wraps by visible terminal cells', () => {
    expect(
      renderText({
        content: '\u001B[31mHello\u001B[0m {red-fg}红色{/red-fg} world',
        overflow: 'wrap',
        width: 8,
      }),
    ).toBe('Hello 红\n色 world');
  });

  it('aligns wide text and applies bounded vertical layout', () => {
    expect(
      renderText({
        align: 'center',
        content: '红色',
        height: 3,
        overflow: 'clip',
        verticalAlign: 'middle',
        width: 8,
      }),
    ).toBe('\n  红色\n');
  });

  it('supports middle truncation with a custom omission', () => {
    expect(
      renderText({
        content: 'deployment',
        omission: '...',
        overflow: 'truncate',
        truncatePosition: 'middle',
        width: 8,
      }),
    ).toBe('de...ent');
  });
});
