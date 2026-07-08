import { describe, expect, it } from 'vitest';

import { renderPalette } from '@/index.js';

describe('Palette', () => {
  it('renders bounded color swatches', () => {
    expect(
      renderPalette({
        height: 2,
        items: [
          { color: '#3b82f6', id: 'primary', label: 'Primary' },
          { color: '#ef4444', id: 'danger', label: 'Danger' },
        ],
        width: 30,
      }),
    ).toBe('■ Primary #3b82f6\n■ Danger #ef4444');
  });
});
