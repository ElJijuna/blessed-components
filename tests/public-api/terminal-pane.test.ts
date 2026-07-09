import { describe, expect, it } from 'vitest';

import { formatTerminalPaneCommand, renderTerminalPane } from '@/index.js';

describe('TerminalPane', () => {
  it('renders command metadata, status, and stream-marked output', () => {
    expect(
      renderTerminalPane({
        command: { args: ['run', 'test'], command: 'npm' },
        lines: [
          { stream: 'stdout', text: 'starting' },
          { stream: 'stderr', text: 'warning' },
        ],
        status: 'running',
        width: 32,
      }),
    ).toBe('$ npm run test [running]\nout │ starting\nerr │ warning');
  });

  it('sanitizes terminal markup and bounds the viewport', () => {
    expect(
      renderTerminalPane({
        height: 2,
        lines: [
          { stream: 'system', text: '{red-fg}boot{/red-fg}' },
          { text: '\u001B[31mready\u001B[0m' },
          { text: 'hidden' },
        ],
        offset: 1,
        status: 'succeeded',
        width: 18,
      }),
    ).toBe('$ [succeeded]\nout │ ready');
  });

  it('formats command metadata without executing it', () => {
    expect(formatTerminalPaneCommand({ args: ['-lc', 'echo ok'], command: 'sh' })).toBe(
      '$ sh -lc echo ok',
    );
  });

  it('rejects invalid dimensions', () => {
    expect(() => renderTerminalPane({ height: -1 })).toThrow(RangeError);
    expect(() => renderTerminalPane({ offset: 1.5 })).toThrow(RangeError);
    expect(() => renderTerminalPane({ width: -1 })).toThrow(RangeError);
  });
});
