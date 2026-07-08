import { describe, expect, it } from 'vitest';

import { formatKeybindingPart, renderKeybindingInput } from '@/index.js';

describe('KeybindingInput', () => {
  it('formats and renders captured shortcut parts', () => {
    expect(formatKeybindingPart('ctrl-k')).toBe('Ctrl+K');
    expect(renderKeybindingInput({ keys: ['ctrl-k', 'shift-enter'], width: 40 })).toBe(
      '○ Ctrl+K + Shift+Enter',
    );
  });
});
