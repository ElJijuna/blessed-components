import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';

import { dialogRoot } from '@/adapters/blessed/dialog.js';
import { overlay } from '@/adapters/blessed/overlay.js';

describe('Blessed Overlay adapter', () => {
  it('opens, restores focus on close, and destroys cleanly', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const trigger = blessed.button({ height: 1, parent: screen, width: 10 });

    try {
      trigger.focus();

      const layer = overlay({
        box: { height: 5, width: 20 },
        data: { defaultOpen: true, id: 'inspector-overlay' },
        parent: screen,
      });

      expect(layer.isOpen).toBe(true);
      expect(layer.element.hidden).toBe(false);
      expect(screen.focused).toBe(layer.element);

      expect(layer.close()).toBe(false);
      expect(layer.isOpen).toBe(false);
      expect(layer.element.hidden).toBe(true);
      expect(screen.focused).toBe(trigger);

      layer.destroy();

      expect(screen.children).not.toContain(layer.element);
    } finally {
      screen.destroy();
    }
  });

  it('keeps controlled visibility unchanged until new data arrives', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onOpenChange = vi.fn();

    try {
      const layer = overlay({
        box: { height: 5, width: 20 },
        data: { id: 'controlled-overlay', onOpenChange, open: false },
        parent: screen,
      });

      expect(layer.open()).toBe(false);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(layer.element.hidden).toBe(true);

      layer.setData({ id: 'controlled-overlay', onOpenChange, open: true });

      expect(layer.isOpen).toBe(true);
      expect(layer.element.hidden).toBe(false);
    } finally {
      screen.destroy();
    }
  });

  it('lets only the top overlay close on Escape and reports modal blocking', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const base = overlay({
        box: { height: 5, width: 20 },
        data: { defaultOpen: true, id: 'base-overlay' },
        parent: screen,
      });
      const modal = overlay({
        box: { height: 3, width: 14 },
        data: { defaultOpen: true, id: 'modal-overlay', modal: true },
        parent: screen,
      });

      expect(base.blocked()).toBe(true);
      expect(modal.blocked()).toBe(false);

      screen.emit('keypress', undefined, { name: 'escape' });

      expect(modal.isOpen).toBe(false);
      expect(base.isOpen).toBe(true);
      expect(base.blocked()).toBe(false);

      screen.emit('keypress', undefined, { name: 'escape' });

      expect(base.isOpen).toBe(false);
    } finally {
      screen.destroy();
    }
  });

  it('shares overlay ordering with Dialog', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const layer = overlay({
        box: { height: 5, width: 20 },
        data: { defaultOpen: true, id: 'layer-under-dialog' },
        parent: screen,
      });
      const dialog = dialogRoot({
        data: { defaultOpen: true, id: 'dialog-above-layer' },
        parent: screen,
      });

      expect(layer.blocked()).toBe(true);

      screen.emit('keypress', undefined, { name: 'escape' });

      expect(dialog.isOpen).toBe(false);
      expect(layer.isOpen).toBe(true);
      expect(layer.blocked()).toBe(false);
    } finally {
      screen.destroy();
    }
  });
});
