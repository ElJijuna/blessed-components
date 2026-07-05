import { describe, expect, it } from 'vitest';
import type { GroupedListSection } from '@/index.js';
import { flattenGroupedListRows, renderGroupedList } from '@/index.js';

const sections: readonly GroupedListSection[] = [
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
];

describe('GroupedList', () => {
  it('flattens section headers and item rows', () => {
    expect(flattenGroupedListRows({ sections }).map((row) => row.type)).toEqual([
      'header',
      'item',
      'item',
      'header',
      'item',
    ]);
  });

  it('renders section headings and item state markers', () => {
    expect(
      renderGroupedList({
        activeId: 'api',
        height: 5,
        sections,
        selectedId: 'redis',
        width: 28,
      }),
    ).toBe('▪ Services\n  ›   API service\n    × Worker pool\n▪ Infrastructure\n    ● Redis cache');
  });

  it('renders from a row offset and rejects invalid dimensions', () => {
    expect(renderGroupedList({ height: 2, offset: 3, sections, width: 20 })).toBe(
      '▪ Infrastructure\n      Redis cache',
    );
    expect(() => renderGroupedList({ height: -1, sections, width: 20 })).toThrow(RangeError);
    expect(() => renderGroupedList({ height: 2, indent: -1, sections, width: 20 })).toThrow(
      RangeError,
    );
  });
});
