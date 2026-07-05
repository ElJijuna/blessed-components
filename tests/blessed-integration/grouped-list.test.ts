import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import { groupedList } from '@/adapters/blessed/grouped-list.js';

describe('Blessed GroupedList adapter', () => {
  it('navigates selectable rows while preserving section headers', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const activeChanges: string[] = [];
    const valueChanges: string[] = [];

    try {
      const groups = groupedList({
        box: { height: 6, width: 32 },
        data: {
          activeId: 'api',
          defaultValue: 'api',
          onActiveIdChange: (id) => activeChanges.push(id),
          onValueChange: (id) => valueChanges.push(id),
          sections: [
            {
              id: 'services',
              items: [
                { id: 'api', label: 'API service' },
                { disabled: true, id: 'worker', label: 'Worker pool' },
              ],
              title: 'Services',
            },
            {
              id: 'infra',
              items: [{ id: 'redis', label: 'Redis cache' }],
              title: 'Infrastructure',
            },
          ],
        },
        parent: screen,
      });

      expect(groups.element.getContent()).toContain('▪ Services');
      expect(groups.activeId()).toBe('api');
      expect(groups.value()).toBe('api');

      expect(groups.next()).toBe('redis');
      expect(activeChanges).toEqual(['redis']);
      expect(groups.selectActive()).toBe('redis');
      expect(groups.value()).toBe('redis');
      expect(valueChanges).toEqual(['redis']);

      groups.setData({
        defaultValue: 'worker',
        sections: [
          {
            id: 'services',
            items: [{ disabled: true, id: 'worker', label: 'Worker pool' }],
            title: 'Services',
          },
        ],
      });

      expect(groups.activeId()).toBeUndefined();
      expect(groups.value()).toBe('worker');

      groups.destroy();
      expect(screen.children).not.toContain(groups.element);
    } finally {
      screen.destroy();
    }
  });
});
