import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { inspector } from '@/adapters/blessed/inspector.js';

describe('Blessed Inspector adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = inspector({
        box: { height: 2, width: 30 },
        data: { value: { ok: true } },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('$ <object> 1 field\n  ok <boolean> true');
      component.setData({ value: ['ready'] });
      expect(component.element.getContent()).toBe('$ <array> 1 item\n  0 <string> "ready"');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
