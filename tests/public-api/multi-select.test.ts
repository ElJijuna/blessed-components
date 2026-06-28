import { describe, expect, it } from 'vitest';

import { renderMultiSelect } from '@/index.js';

describe('MultiSelect', () => {
  const items = [
    { id: 'api', label: 'API' },
    { id: 'worker', label: 'Worker' },
    { disabled: true, id: 'db', label: 'Database' },
  ] as const;

  it('renders a closed trigger with placeholder, labels, or count summary', () => {
    expect(renderMultiSelect({ height: 4, items, width: 20 })).toBe('▸ Select options');
    expect(renderMultiSelect({ height: 4, items, values: ['api', 'worker'], width: 20 })).toBe(
      '▸ API, Worker',
    );
    expect(
      renderMultiSelect({ height: 4, items, values: ['api', 'worker', 'db'], width: 20 }),
    ).toBe('▸ 3 selected');
  });

  it('renders an open bounded option list', () => {
    expect(
      renderMultiSelect({
        activeId: 'worker',
        height: 4,
        items,
        open: true,
        values: ['api'],
        width: 20,
      }),
    ).toBe('▾ API\n  [x] API\n› [ ] Worker\n  [×] Database');
  });

  it('sanitizes labels and rejects invalid input', () => {
    expect(
      renderMultiSelect({
        height: 3,
        items: [{ id: 'safe', label: '{red-fg}Safe{/red-fg}' }],
        open: true,
        values: ['safe'],
        width: 12,
      }),
    ).toBe('▾ Safe\n  [x] Safe');

    expect(() =>
      renderMultiSelect({ height: 2, items: [{ id: '', label: 'Bad' }], open: true, width: 10 }),
    ).toThrow(RangeError);
    expect(() => renderMultiSelect({ height: -1, items, width: 10 })).toThrow(RangeError);
  });
});
