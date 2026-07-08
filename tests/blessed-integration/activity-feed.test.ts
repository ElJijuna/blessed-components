import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { activityFeed } from '@/adapters/blessed/activity-feed.js';

describe('Blessed ActivityFeed adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = activityFeed({
        box: { height: 2, width: 30 },
        data: { items: [{ id: '1', label: 'Deploy', tone: 'success' }] },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('✓ Deploy');
      component.setData({ items: [{ id: '2', label: 'Done', tone: 'success' }] });
      expect(component.element.getContent()).toBe('✓ Done');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
