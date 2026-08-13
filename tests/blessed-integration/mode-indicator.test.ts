import { PassThrough } from 'node:stream';
import blessed from 'blessed';
import { describe, expect, it } from 'vitest';
import { modeIndicator } from '@/adapters/blessed/mode-indicator.js';

describe('Blessed ModeIndicator adapter', () => {
  it('creates, updates, and destroys its element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });

    try {
      const indicator = modeIndicator({
        box: { width: 30 },
        data: { capabilities: { colorLevel: 0, unicode: false }, mode: 'normal' },
        parent: screen,
      });

      expect(indicator.element.getContent()).toBe('[NORMAL]');
      indicator.setData({
        capabilities: { colorLevel: 0, unicode: true },
        detail: 'editing',
        mode: 'insert',
        modified: true,
      });
      expect(indicator.element.getContent()).toBe('[INSERT ●] editing');
      indicator.destroy();
      expect(screen.children).not.toContain(indicator.element);
    } finally {
      screen.destroy();
    }
  });
});
