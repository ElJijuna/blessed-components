import { describe, expect, it } from 'vitest';

import { measurePreformatted, renderPreformatted } from '@/index.js';

describe('Preformatted', () => {
  it('preserves spaces and clips through viewport offsets', () => {
    expect(
      renderPreformatted({
        content: '  alpha\nbeta = 2\ngamma',
        height: 2,
        horizontalOffset: 2,
        verticalOffset: 0,
        width: 5,
      }),
    ).toBe('alpha\nta = ');
  });

  it('supports vertical offsets without wrapping', () => {
    expect(
      renderPreformatted({
        content: 'first line\nsecond line\nthird line',
        height: 2,
        verticalOffset: 1,
        width: 8,
      }),
    ).toBe('second l\nthird li');
  });

  it('sanitizes dynamic content before measuring and rendering', () => {
    expect(
      renderPreformatted({
        content: '\u001B[31m{bold}  value{/bold}\u001B[0m',
        width: 8,
      }),
    ).toBe('  value');
    expect(measurePreformatted('{red-fg}wide{/red-fg}\nlines')).toEqual({
      lineCount: 2,
      maxLineWidth: 5,
    });
  });

  it('rejects negative viewport values', () => {
    expect(() => renderPreformatted({ content: 'x', horizontalOffset: -1 })).toThrow(RangeError);
    expect(() => renderPreformatted({ content: 'x', verticalOffset: -1 })).toThrow(RangeError);
    expect(() => renderPreformatted({ content: 'x', width: -1 })).toThrow(RangeError);
  });
});
