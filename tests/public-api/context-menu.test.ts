import { describe, expect, it } from 'vitest';

import { renderContextMenu } from '@/index.js';

describe('ContextMenu', () => {
  it('renders active and disabled action rows', () => {
    expect(
      renderContextMenu({
        activeId: 'open',
        items: [
          { id: 'open', label: 'Open', shortcut: 'Enter' },
          { disabled: true, id: 'delete', label: 'Delete' },
        ],
      }),
    ).toBe(['> Open Enter', 'x Delete'].join('\n'));
  });
});
