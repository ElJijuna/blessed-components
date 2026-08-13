import { describe, expect, it } from 'vitest';
import { MODE_INDICATOR_ASCII_CHARACTERS, renderModeIndicator } from '@/index.js';

describe('ModeIndicator', () => {
  it('renders mode, detail, modified state, and shortcut', () => {
    expect(
      renderModeIndicator({ detail: '3 lines', mode: 'visual', modified: true, shortcut: 'Esc' }),
    ).toBe('[VISUAL ●] 3 lines (Esc)');
  });
  it('supports ASCII, custom labels, and casing', () => {
    expect(
      renderModeIndicator({
        characters: MODE_INDICATOR_ASCII_CHARACTERS,
        label: 'Cmd',
        mode: 'command',
        modified: true,
        uppercase: false,
      }),
    ).toBe('[Cmd *]');
  });
  it('sanitizes terminal markup', () => {
    expect(
      renderModeIndicator({ detail: '{bold}editing{/bold}', mode: '{red-fg}insert{/red-fg}' }),
    ).toBe('[INSERT] editing');
  });
  it('validates required text and characters', () => {
    expect(() => renderModeIndicator({ mode: '' })).toThrow(RangeError);
    expect(() =>
      renderModeIndicator({ characters: { close: ']', modified: '', open: '[' }, mode: 'normal' }),
    ).toThrow(RangeError);
  });
});
