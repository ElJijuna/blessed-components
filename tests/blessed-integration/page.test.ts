import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { page } from '@/adapters/blessed/page.js';

describe('Blessed Page adapter', () => {
  it('creates, lays out, updates, and destroys Page regions', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const component = page({
        box: { height: 8, width: 40 },
        data: {
          actions: 'q quit',
          content: 'No deploys running.',
          footer: 'Updated now',
          gap: 1,
          title: 'Deployments',
        },
        parent: screen,
      });

      expect(component.header.getContent()).toBe('Deployments                       q quit');
      expect(component.body.getContent()).toBe('No deploys running.');
      expect(component.body.top).toBe(2);
      expect(component.body.height).toBe(4);
      expect(component.footer.getContent()).toBe('Updated now');
      expect(component.footer.hidden).toBe(false);

      component.setData({
        content: 'All clear.',
        title: 'Status',
      });

      expect(component.header.getContent()).toBe('Status');
      expect(component.body.getContent()).toBe('All clear.');
      expect(component.footer.hidden).toBe(true);

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
