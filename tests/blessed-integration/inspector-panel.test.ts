import { PassThrough } from 'node:stream';
import blessed from 'blessed';
import { describe, expect, it, vi } from 'vitest';
import { inspectorPanel } from '@/adapters/blessed/inspector-panel.js';

describe('Blessed InspectorPanel adapter', () => {
  it('navigates tabs, delegates actions, updates, focuses, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });
    const onAction = vi.fn();

    try {
      const panel = inspectorPanel({
        box: { height: 8, width: 60 },
        data: {
          actions: [{ id: 'refresh', label: 'Refresh' }],
          onAction,
          tabs: [
            { content: 'JSON body', id: 'json', label: 'JSON' },
            { content: 'Log body', id: 'logs', label: 'Logs' },
          ],
          title: 'API',
        },
        parent: screen,
      });

      expect(panel.activeTabId()).toBe('json');
      expect(panel.nextTab()).toBe('logs');
      expect(panel.element.getContent()).toContain('Log body');
      expect(panel.activateAction('refresh')?.id).toBe('refresh');
      expect(onAction).toHaveBeenCalledOnce();
      panel.focus();
      expect(screen.focused).toBe(panel.element);
      panel.setData({
        tabs: [{ content: 'Metrics body', id: 'metrics', label: 'Metrics' }],
        title: 'Worker',
      });
      expect(panel.activeTabId()).toBe('metrics');
      panel.destroy();
      expect(screen.children).not.toContain(panel.element);
    } finally {
      screen.destroy();
    }
  });
});
