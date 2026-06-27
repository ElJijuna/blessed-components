import { describe, expect, it } from 'vitest';

import { renderHelpOverlay } from '@/index.js';

describe('HelpOverlay', () => {
  it('renders grouped shortcuts and filters by query', () => {
    expect(
      renderHelpOverlay({
        height: 6,
        query: 'save',
        sections: [
          {
            items: [
              { description: '{bold}Save file{/bold}', id: 'save', keys: ['C-s'] },
              { description: 'Open palette', id: 'palette', keys: ['C-p'] },
            ],
            title: 'Editor',
          },
          {
            items: [{ description: 'Follow logs', id: 'logs.follow', keys: ['f'] }],
            title: 'Logs',
          },
        ],
        width: 36,
      }),
    ).toBe('Keyboard shortcuts\nSearch: save\n# Editor\nC-s  Save file');
  });

  it('renders empty and no-results states without mutating sections', () => {
    const sections = [{ items: [], title: 'Empty' }] as const;

    expect(renderHelpOverlay({ height: 4, sections, width: 24 })).toBe(
      'Keyboard shortcuts\n- No shortcuts',
    );
    expect(
      renderHelpOverlay({
        height: 4,
        query: 'missing',
        sections: [
          { items: [{ description: 'Save', id: 'save', keys: ['C-s'] }], title: 'Editor' },
        ],
        width: 24,
      }),
    ).toBe('Keyboard shortcuts\nSearch: missing\n- No matching shortcuts');
    expect(sections).toEqual([{ items: [], title: 'Empty' }]);
  });

  it('rejects invalid dimensions and malformed rows', () => {
    expect(() => renderHelpOverlay({ height: -1, sections: [], width: 10 })).toThrow(RangeError);
    expect(() =>
      renderHelpOverlay({
        height: 4,
        sections: [{ items: [{ description: 'Bad', id: '', keys: ['x'] }], title: 'Editor' }],
        width: 20,
      }),
    ).toThrow(RangeError);
    expect(() =>
      renderHelpOverlay({
        height: 4,
        sections: [{ items: [{ description: 'Bad', id: 'bad', keys: [] }], title: 'Editor' }],
        width: 20,
      }),
    ).toThrow(RangeError);
  });
});
