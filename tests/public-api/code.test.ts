import { describe, expect, it } from 'vitest';

import { renderCode } from '@/index.js';

describe('Code', () => {
  it('renders safe inline code with default framing', () => {
    expect(renderCode({ content: 'npm run build' })).toBe('`npm run build`');
  });

  it('supports plain output and sanitizes dynamic content', () => {
    expect(
      renderCode({
        content: '\u001B[31m{bold}process.env.NODE_ENV{/bold}\u001B[0m',
        variant: 'plain',
      }),
    ).toBe('process.env.NODE_ENV');
  });

  it('truncates or clips to one line', () => {
    expect(renderCode({ content: 'blessed-components', width: 12 })).toBe('`blessed-co…');
    expect(renderCode({ content: 'blessed-components', overflow: 'clip', width: 12 })).toBe(
      '`blessed-com',
    );
  });

  it('rejects empty and multiline content', () => {
    expect(() => renderCode({ content: '' })).toThrow(RangeError);
    expect(() => renderCode({ content: 'const x = 1;\nconst y = 2;' })).toThrow(RangeError);
  });
});
