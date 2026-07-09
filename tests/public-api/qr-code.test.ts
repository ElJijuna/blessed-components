import { describe, expect, it } from 'vitest';

import { renderQrCode } from '@/index.js';

describe('QrCode', () => {
  it('renders supplied module matrix and rejects ragged matrices', () => {
    expect(
      renderQrCode({
        matrix: [
          [true, false],
          [false, true],
        ],
        off: '..',
        on: '##',
      }),
    ).toBe(['##..', '..##'].join('\n'));
    expect(() => renderQrCode({ matrix: [[true], [false, true]] })).toThrow(RangeError);
  });
});
