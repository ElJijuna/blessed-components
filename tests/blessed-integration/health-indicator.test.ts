import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { healthIndicator } from '@/adapters/blessed/health-indicator.js';

describe('Blessed HealthIndicator adapter', () => {
  it('selects ASCII fallback and updates content', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = healthIndicator({
        box: { height: 3, width: 40 },
        data: {
          capabilities: { colorLevel: 1, unicode: false },
          services: [
            { label: 'API', state: 'healthy' },
            { label: 'Queue', reason: '{bold}retry backlog{/bold}', state: 'degraded' },
          ],
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe(
        '! Health: Degraded - 1/2 affected\n- Queue: retry backlog',
      );

      component.setData({
        capabilities: { colorLevel: 1, unicode: false },
        services: [{ label: 'API', state: 'healthy' }],
      });

      expect(component.element.getContent()).toBe('+ Health: Healthy - 1/1 services');
    } finally {
      screen.destroy();
    }
  });
});
