import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { accordion } from '@/adapters/blessed/accordion.js';

describe('Blessed Accordion adapter', () => {
  it('creates, toggles, navigates, updates, and destroys sections', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const changes: string[][] = [];

    try {
      const component = accordion({
        box: { height: 10, width: 40 },
        data: {
          defaultExpandedIds: ['build'],
          gap: 1,
          onExpandedIdsChange: (expandedIds) => changes.push(expandedIds),
          sections: [
            { bodyHeight: 2, content: 'Compile\nBundle', id: 'build', title: 'Build' },
            { bodyHeight: 1, content: 'Vitest', id: 'test', title: 'Test' },
          ],
        },
        parent: screen,
      });

      expect(component.value()).toEqual(['build']);
      expect(component.sections().get('build')?.body.hidden).toBe(false);
      expect(component.sections().get('test')?.body.hidden).toBe(true);

      expect(component.setSectionExpanded('test', true)).toBe(true);
      expect(component.value()).toEqual(['test']);
      expect(changes).toEqual([['test']]);

      expect(component.next()).toBe('test');
      expect(component.previous()).toBe('build');

      component.setData({
        allowMultiple: true,
        defaultExpandedIds: ['build', 'test'],
        sections: [
          { bodyHeight: 1, content: 'Compile', id: 'build', title: 'Build' },
          { bodyHeight: 1, content: 'Vitest', id: 'test', title: 'Test' },
        ],
      });

      expect(component.value()).toEqual(['build', 'test']);
      expect(component.sections().get('build')?.body.getContent()).toBe('Compile');

      component.destroy();

      expect(screen.children).not.toContain(component.element);
    } finally {
      screen.destroy();
    }
  });

  it('supports controlled state without mutating value internally', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const changes: string[][] = [];

    try {
      const component = accordion({
        data: {
          expandedIds: ['build'],
          onExpandedIdsChange: (expandedIds) => changes.push(expandedIds),
          sections: [
            { bodyHeight: 1, content: 'Compile', id: 'build', title: 'Build' },
            { bodyHeight: 1, content: 'Vitest', id: 'test', title: 'Test' },
          ],
        },
        parent: screen,
      });

      expect(component.setSectionExpanded('test', true)).toBe(true);
      expect(component.value()).toEqual(['build']);
      expect(changes).toEqual([['test']]);
    } finally {
      screen.destroy();
    }
  });
});
