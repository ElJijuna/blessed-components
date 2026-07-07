import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { diffView } from '@/adapters/blessed/diff-view.js';

describe('Blessed DiffView adapter', () => {
  const lines = [
    { content: '@@ -1,4 +1,4 @@', type: 'hunk' },
    { content: 'const status = "queued";', oldLine: 1, type: 'remove' },
    { content: 'const status = "running";', newLine: 1, type: 'add' },
    { content: 'export { status };', newLine: 2, oldLine: 2, type: 'context' },
  ] as const;

  it('renders, scrolls with keyboard, reports offset changes, and destroys cleanly', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOffsetChange = vi.fn();

    try {
      const patch = diffView({
        box: { height: 2, width: 28 },
        data: { lines, onOffsetChange },
        parent: screen,
      });

      expect(patch.element.getContent()).toBe(
        '    @ @@ -1,4 +1,4 @@\n1   - const status = "queue…',
      );

      patch.element.emit('keypress', undefined, { name: 'down' });

      expect(patch.offset()).toBe(1);
      expect(onOffsetChange).toHaveBeenCalledWith(1);
      expect(patch.element.getContent()).toBe(
        '1   - const status = "queue…\n  1 + const status = "runni…',
      );

      patch.setData({
        lines: [{ content: 'unchanged', newLine: 1, oldLine: 1, type: 'context' }],
      });

      expect(patch.offset()).toBe(0);
      expect(patch.element.getContent()).toBe('1 1   unchanged');

      patch.destroy();
      expect(screen.children).not.toContain(patch.element);
    } finally {
      screen.destroy();
    }
  });
});
