import { describe, expect, it } from 'vitest';

import { renderRepl } from '@/index.js';

describe('REPL', () => {
  it('renders history and current prompt', () => {
    expect(renderRepl({ currentInput: 'Math.', history: [{ input: '1 + 1', output: '2' }] })).toBe(
      ['> 1 + 1', '2', '> Math.'].join('\n'),
    );
  });
});
