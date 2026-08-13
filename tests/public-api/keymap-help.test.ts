import { describe, expect, it } from 'vitest';
import { KEYMAP_HELP_ASCII_CHARACTERS, renderKeymapHelp, renderKeymapHelpModel } from '@/index.js';

describe('KeymapHelp', () => {
  const commands = [
    { description: 'Save file', id: 'save', keys: ['C-s'], scope: 'Editor' },
    { description: 'Sync file', id: 'sync', keys: ['C-s'], scope: 'Editor' },
    {
      description: 'Follow logs',
      disabled: true,
      disabledReason: 'Not streaming',
      id: 'follow',
      keys: ['f'],
      scope: 'Logs',
    },
  ] as const;

  it('groups scopes and marks conflicts and disabled commands', () => {
    expect(renderKeymapHelp({ characters: KEYMAP_HELP_ASCII_CHARACTERS, commands })).toBe(
      '# Editor\n! C-s               Save file\n! C-s               Sync file\n# Logs\nx f                 Follow logs (Not streaming)',
    );
  });
  it('filters and reports conflicts and visible ids', () => {
    expect(renderKeymapHelpModel({ commands, query: 'sync' })).toEqual({
      content: '■ Editor\n⚠ C-s               Sync file',
      conflictingKeys: ['C-s'],
      visibleCommandIds: ['sync'],
    });
  });
  it('supports scope filtering and empty results', () => {
    expect(renderKeymapHelp({ commands, query: 'missing', scope: 'Editor' })).toBe(
      '- No matching commands',
    );
  });
  it('validates commands and dimensions', () => {
    expect(() => renderKeymapHelp({ commands, width: -1 })).toThrow(RangeError);
    expect(() =>
      renderKeymapHelp({ commands: [{ description: 'Bad', id: 'bad', keys: [], scope: 'App' }] }),
    ).toThrow(RangeError);
  });
});
