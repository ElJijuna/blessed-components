import { PassThrough } from 'node:stream';
import blessed from 'blessed';
import { describe, expect, it } from 'vitest';
import { footerBar } from '@/adapters/blessed/footer-bar.js';

describe('Blessed FooterBar adapter', () => {
  it('creates, updates, positions, and destroys its element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });

    try {
      const footer = footerBar({
        data: {
          capabilities: { colorLevel: 0, unicode: false },
          context: 'NORMAL',
          message: 'Ready',
          shortcuts: [{ key: '?', label: 'help' }],
          width: 40,
        },
        parent: screen,
      });

      expect(footer.element.bottom).toBe(0);
      expect(footer.element.getContent()).toContain('NORMAL | Ready');
      expect(footer.element.getContent()).toContain('[?] help');
      footer.setData({
        capabilities: { colorLevel: 0, unicode: true },
        message: 'Saved',
        tone: 'success',
        width: 30,
      });
      expect(footer.element.getContent()).toContain('✓ Saved');
      footer.destroy();
      expect(screen.children).not.toContain(footer.element);
    } finally {
      screen.destroy();
    }
  });
});
