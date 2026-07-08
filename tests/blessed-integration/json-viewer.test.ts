import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { jsonViewer } from '@/adapters/blessed/json-viewer.js';

describe('Blessed JsonViewer adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = jsonViewer({
        box: { height: 2, width: 30 },
        data: { value: { ok: true } },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('▾ $ Object(1)\n    ok: true');
      component.setData({ value: ['ready'] });
      expect(component.element.getContent()).toBe('▾ $ Array(1)\n    0: "ready"');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
