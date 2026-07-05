import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { loadingOverlay } from '@/adapters/blessed/loading-overlay.js';

describe('Blessed LoadingOverlay adapter', () => {
  it('opens, ticks, updates, closes, and destroys a modal loading layer', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const frames: number[] = [];

    try {
      const loading = loadingOverlay({
        box: { height: 5, width: 30 },
        data: {
          autoStart: false,
          defaultOpen: true,
          frames: ['.', 'o'],
          id: 'loading',
          label: 'Deploying',
          onFrame: ({ frame }) => frames.push(frame),
        },
        parent: screen,
      });

      expect(loading.isOpen).toBe(true);
      expect(loading.element.hidden).toBe(false);
      expect(loading.element.getContent()).toContain('. Deploying');
      expect(loading.running).toBe(false);

      loading.tick();
      expect(frames).toEqual([1]);
      expect(loading.element.getContent()).toContain('o Deploying');

      loading.setData({
        autoStart: false,
        defaultOpen: true,
        description: 'Almost done',
        frames: ['.'],
        id: 'loading',
        label: 'Publishing',
      });
      expect(loading.element.getContent()).toContain('. Publishing');
      expect(loading.element.getContent()).toContain('Almost done');

      expect(loading.close()).toBe(false);
      expect(loading.element.hidden).toBe(true);

      loading.destroy();
      expect(screen.children).not.toContain(loading.element);
    } finally {
      screen.destroy();
    }
  });
});
