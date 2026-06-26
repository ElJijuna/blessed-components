import { describe, expect, it } from 'vitest';

import { renderKbd } from '@/index.js';

describe('Kbd', () => {
  it('renders normalized terminal chords', () => {
    expect(renderKbd({ keys: 'C-s' })).toBe('[Ctrl]+[S]');
  });

  it('renders multiple shortcut alternatives', () => {
    expect(renderKbd({ keys: ['M-enter', 'S-tab'] })).toBe('[Alt]+[Enter] / [Shift]+[Tab]');
  });

  it('supports plain output and custom separators', () => {
    expect(
      renderKbd({
        keySeparator: ' + ',
        keys: 'Ctrl+Shift+p',
        shortcutSeparator: ' or ',
        variant: 'plain',
      }),
    ).toBe('Ctrl + Shift + P');
  });

  it('sanitizes keys and truncates one-line output', () => {
    expect(
      renderKbd({
        keys: ['\u001B[31m{bold}C-x{/bold}\u001B[0m', 'C-c'],
        width: 14,
      }),
    ).toBe('[Ctrl]+[X] / …');
  });

  it('rejects empty keys and invalid separators', () => {
    expect(() => renderKbd({ keys: '' })).toThrow(RangeError);
    expect(() => renderKbd({ keySeparator: '', keys: 'C-s' })).toThrow(RangeError);
  });
});
