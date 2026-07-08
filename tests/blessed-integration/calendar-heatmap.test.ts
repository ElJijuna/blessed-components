import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { calendarHeatmap } from '@/adapters/blessed/calendar-heatmap.js';

describe('Blessed CalendarHeatmap adapter', () => {
  it('creates, updates, and destroys a Blessed element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });

    try {
      const days = [0, 1, 2, 3, 4, 0, 4].map((value, index) => ({
        date: `2026-07-${String(index + 1).padStart(2, '0')}`,
        value,
      }));
      const component = calendarHeatmap({
        box: { height: 7, width: 4 },
        data: { days, max: 4 },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('·\n░\n▒\n▓\n█\n·\n█');
      component.setData({ days: [], max: 4 });
      expect(component.element.getContent()).toBe('No …');
      expect(screen.children).toContain(component.element);
      component.destroy();
      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });
});
