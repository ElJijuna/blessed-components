import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { timeline } from '@/adapters/blessed/timeline.js';

describe('Blessed Timeline adapter', () => {
  it('renders with terminal-specific markers and updates data', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const events = timeline({
        box: { height: 2, width: 42 },
        data: {
          capabilities: { colorLevel: 0, unicode: false },
          items: [
            {
              id: 'queued',
              timestamp: '2026-06-29T15:25:00Z',
              title: 'Deploy queued',
              tone: 'info',
            },
            {
              id: 'failed',
              title: 'Deploy failed',
              tone: 'danger',
            },
          ],
          timeZone: 'UTC',
        },
        parent: screen,
      });

      expect(events.element.getContent()).toBe(
        'i Jun 29, 2026, 3:25 PM Deploy queued\nx Deploy failed',
      );

      events.setData({
        capabilities: { colorLevel: 0, unicode: true },
        items: [{ id: 'healthy', title: 'Deploy healthy', tone: 'success' }],
      });

      expect(events.element.getContent()).toBe('✓ Deploy healthy');
    } finally {
      screen.destroy();
    }
  });
});
