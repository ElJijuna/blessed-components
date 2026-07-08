import { describe, expect, it } from 'vitest';

import { renderTextArea } from '@/index.js';

describe('TextArea', () => {
  it('renders bounded multiline text with line numbers', () => {
    expect(
      renderTextArea({
        cursorLine: 1,
        height: 2,
        lineNumbers: true,
        value: 'alpha\n{red-fg}beta{/red-fg}',
        width: 20,
      }),
    ).toBe(' 1 alpha\n›2 beta');
  });
});
