import { describe, expect, it } from 'vitest';

import { renderSelect } from '@/index.js';

describe('Select', () => {
  const items = [
    { id: 'prod', label: 'Production' },
    { id: 'stage', label: 'Staging' },
    { disabled: true, id: 'dev', label: 'Development' },
  ] as const;

  it('renders a closed trigger with selected value or placeholder', () => {
    expect(renderSelect({ height: 4, items, value: 'prod', width: 20 })).toBe('▸ Production');
    expect(renderSelect({ height: 4, items, placeholder: 'Choose env', width: 20 })).toBe(
      '▸ Choose env',
    );
  });

  it('renders an open bounded option list', () => {
    expect(
      renderSelect({
        activeId: 'stage',
        height: 4,
        items,
        open: true,
        value: 'prod',
        width: 20,
      }),
    ).toBe('▾ Production\n  ● Production\n› ○ Staging\n  × Development');
  });

  it('sanitizes labels and rejects invalid input', () => {
    expect(
      renderSelect({
        height: 3,
        items: [{ id: 'safe', label: '{red-fg}Safe{/red-fg}' }],
        open: true,
        value: 'safe',
        width: 12,
      }),
    ).toBe('▾ Safe\n  ● Safe');

    expect(() =>
      renderSelect({ height: 2, items: [{ id: '', label: 'Bad' }], open: true, width: 10 }),
    ).toThrow(RangeError);
    expect(() => renderSelect({ height: -1, items, width: 10 })).toThrow(RangeError);
  });
});
