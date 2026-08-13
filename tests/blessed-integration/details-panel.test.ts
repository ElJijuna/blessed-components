import { PassThrough } from 'node:stream';
import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';
import { detailsPanel } from '@/adapters/blessed/details-panel.js';

describe('Blessed DetailsPanel adapter', () => {
  it('lays out, updates, delegates back, and destroys regions', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onBack = vi.fn();

    try {
      const panel = detailsPanel({
        box: { height: 8, width: 40 },
        data: {
          detailContent: 'API healthy',
          masterContent: 'API\nWorker',
          onBack,
          selectedId: 'api',
        },
        parent: screen,
      });

      expect(panel.mode()).toBe('detail-only');
      expect(panel.master.hidden).toBe(true);
      expect(panel.detail.getContent()).toBe('API healthy');
      expect(panel.back()).toBe(true);
      expect(onBack).toHaveBeenCalledOnce();
      panel.setData({ masterContent: 'Updated' });
      expect(panel.mode()).toBe('master-only');
      expect(panel.master.getContent()).toBe('Updated');
      panel.destroy();
      expect(screen.children).not.toContain(panel.element);
    } finally {
      screen.destroy();
    }
  });
});
