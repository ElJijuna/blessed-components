import { describe, expect, it } from 'vitest';

import { createTheme, resolveBoxTheme } from '../../src/index.js';

describe('Box', () => {
  it('resolves semantic foreground, background, and border colors', () => {
    const theme = createTheme({
      colors: {
        background: 'black',
        border: 'cyan',
        foreground: 'white',
      },
    });

    expect(
      resolveBoxTheme({
        capabilities: { colorLevel: 1 },
        theme,
      }),
    ).toEqual({
      background: 'black',
      border: 'cyan',
      foreground: 'white',
    });
  });
});
