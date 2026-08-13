import { describe, expect, it } from 'vitest';
import {
  COMMAND_CENTER_ASCII_CHARACTERS,
  filterCommandCenterItems,
  renderCommandCenter,
  renderCommandCenterModel,
} from '@/index.js';

describe('CommandCenter', () => {
  const items = [
    {
      description: 'Deploy production',
      group: 'Operations',
      id: 'deploy',
      label: 'Deploy',
      shortcut: 'D',
    },
    { group: 'Navigation', id: 'logs', label: 'Open logs' },
    { disabled: true, group: 'Operations', id: 'rollback', label: 'Rollback' },
  ] as const;

  it('renders recent and grouped commands', () => {
    expect(
      renderCommandCenter({
        activeId: 'deploy',
        characters: COMMAND_CENTER_ASCII_CHARACTERS,
        items,
        recentIds: ['deploy'],
      }),
    ).toBe(
      '> Type a command\n# Recent\n> @ Deploy - Deploy production [D]\n# Navigation\n  Open logs\n# Operations\nx Rollback',
    );
  });
  it('filters searchable metadata', () => {
    expect(filterCommandCenterItems(items, 'production').map(({ id }) => id)).toEqual(['deploy']);
  });
  it('clips and reports visible commands', () => {
    expect(renderCommandCenterModel({ height: 3, items, query: 'logs' })).toEqual({
      content: '> logs\n■ Navigation\n  Open logs',
      visibleItemIds: ['logs'],
    });
  });
  it('validates dimensions and identity', () => {
    expect(() => renderCommandCenter({ items, width: -1 })).toThrow(RangeError);
    expect(() => renderCommandCenter({ items: [{ id: '', label: 'Bad' }] })).toThrow(RangeError);
  });
});
