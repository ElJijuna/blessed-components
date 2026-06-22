import { describe, expect, it } from 'vitest';

import { renderSpinner } from '@/index.js';

describe('Spinner', () => {
  it('renders one deterministic frame with an optional label', () => {
    expect(
      renderSpinner({
        frame: 2,
        label: 'Loading',
      }),
    ).toBe('⠹ Loading');
  });

  it('wraps frames and sanitizes terminal markup in labels', () => {
    expect(
      renderSpinner({
        frame: 5,
        frames: ['|', '/', '-', '\\'],
        label: '\u001B[31m{red-fg}Working{/red-fg}\u001B[0m',
      }),
    ).toBe('/ Working');
  });

  it('rejects invalid frame indexes and multi-cell frames', () => {
    expect(() => renderSpinner({ frame: -1 })).toThrow(RangeError);
    expect(() => renderSpinner({ frame: 0, frames: ['OK'] })).toThrow(RangeError);
  });
});
