import { describe, expect, it } from 'vitest';

import { calculateViewportLayout } from '@/index.js';

describe('Viewport', () => {
  it('positions larger content behind the visible window', () => {
    expect(
      calculateViewportLayout({
        contentHeight: 20,
        contentWidth: 40,
        height: 5,
        width: 10,
        x: 7,
        y: 3,
      }),
    ).toEqual({
      content: {
        height: 20,
        left: -7,
        top: -3,
        width: 40,
      },
      visible: {
        height: 5,
        width: 10,
        x: 7,
        y: 3,
      },
    });
  });
});
