import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { bulletChart } from '@/adapters/blessed/bullet-chart.js';

describe('Blessed BulletChart adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = bulletChart({
        box: { height: 1, width: 20 },
        data: { value: 5, width: 10 },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('[█         ] 5');
      component.setData({ max: 10, target: 8, value: 5, width: 10 });
      expect(component.element.getContent()).toBe('[██████ |  ] 5');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
