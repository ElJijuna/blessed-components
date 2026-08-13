import { PassThrough } from 'node:stream';
import blessed from 'blessed';
import { describe, expect, it } from 'vitest';
import { dashboardGrid } from '@/adapters/blessed/dashboard-grid.js';

describe('Blessed DashboardGrid adapter', () => {
  it('creates stable slots, responds, updates, and destroys', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm',
    });

    try {
      const dashboard = dashboardGrid({
        box: { height: 12, width: 70 },
        data: { items: [{ id: 'health' }, { id: 'cpu' }], rowHeight: 5 },
        parent: screen,
        slots: { health: { border: 'line', label: ' Health ' } },
      });

      expect(dashboard.columns()).toBe(2);
      const health = dashboard.slot('health');

      expect(health).toBeDefined();
      expect(health?.width).toBeGreaterThan(0);
      dashboard.setData({ items: [{ columnSpan: 2, id: 'health' }, { id: 'logs' }] });
      expect(dashboard.slot('health')).toBe(health);
      expect(dashboard.slot('cpu')).toBeUndefined();
      expect(dashboard.slot('logs')).toBeDefined();
      dashboard.destroy();
      expect(screen.children).not.toContain(dashboard.element);
    } finally {
      screen.destroy();
    }
  });
});
