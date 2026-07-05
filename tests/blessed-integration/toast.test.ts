import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { toast } from '@/adapters/blessed/toast.js';

describe('Blessed Toast adapter', () => {
  it('creates, updates, prunes, and destroys a toast stack', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const stack = toast({
        box: { height: 8, width: 32 },
        data: {
          maxToasts: 2,
          toasts: [{ createdAt: 0, durationMs: 100, id: 'start', title: 'Started' }],
        },
        parent: screen,
      });

      expect(stack.element.hidden).toBe(false);
      expect(stack.element.getContent()).toBe('i Started');

      stack.add({
        createdAt: 10,
        description: 'Production promoted',
        durationMs: 100,
        id: 'deploy',
        title: 'Deploy complete',
        tone: 'success',
      });

      expect(stack.items().map((item) => item.id)).toEqual(['deploy', 'start']);
      expect(stack.element.getContent()).toContain('+ Deploy complete');

      stack.prune(111);
      expect(stack.items()).toEqual([]);
      expect(stack.element.hidden).toBe(true);

      stack.setData({
        toasts: [{ id: 'manual', title: 'Manual toast', tone: 'warning' }],
        width: 18,
      });
      expect(stack.element.getContent()).toBe('! Manual toast');

      stack.dismiss('manual');
      expect(stack.items()).toEqual([]);

      stack.destroy();
      expect(screen.children).not.toContain(stack.element);
    } finally {
      screen.destroy();
    }
  });
});
