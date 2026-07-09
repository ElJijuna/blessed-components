import { describe, expect, it } from 'vitest';

import { renderShortcutRecorder } from '@/index.js';

describe('ShortcutRecorder', () => {
  it('renders empty and recorded keypress names', () => {
    expect(renderShortcutRecorder({ items: [] })).toBe(['Shortcuts', 'Press a key'].join('\n'));
    expect(renderShortcutRecorder({ items: [{ key: 'C-c', sequence: '\\u0003' }] })).toBe(
      ['Shortcuts', 'C-c (\\u0003)'].join('\n'),
    );
  });
});
