import { describe, expect, it } from 'vitest';
import { FOOTER_BAR_ASCII_CHARACTERS, renderFooterBar, renderFooterBarModel } from '@/index.js';

describe('FooterBar', () => {
  const shortcuts = [
    { key: 'Esc', label: 'clear' },
    { key: '?', label: 'help' },
  ] as const;

  it('renders context, transient state, and right-aligned shortcuts', () => {
    expect(
      renderFooterBar({
        context: '3 selected',
        message: 'Saved',
        pad: false,
        shortcuts,
        tone: 'success',
        width: 48,
      }),
    ).toBe('3 selected │ ✓ Saved       [Esc] clear  [?] help');
  });
  it('uses ASCII markers and sanitizes dynamic terminal text', () => {
    expect(
      renderFooterBar({
        characters: FOOTER_BAR_ASCII_CHARACTERS,
        message: '{bold}Failed{/bold}',
        pad: false,
        tone: 'danger',
        width: 20,
      }),
    ).toBe('x Failed');
  });
  it('clips hints responsively and reports visible indexes', () => {
    expect(renderFooterBarModel({ context: 'Ready', pad: false, shortcuts, width: 20 })).toEqual({
      content: 'Ready    [Esc] clear',
      visibleShortcutIndexes: [0],
    });
  });
  it('pads output and validates input', () => {
    expect(renderFooterBar({ message: 'Ready', width: 20 })).toHaveLength(20);
    expect(() => renderFooterBar({ width: -1 })).toThrow(RangeError);
    expect(() => renderFooterBar({ shortcuts: [{ key: '', label: 'help' }], width: 20 })).toThrow(
      RangeError,
    );
  });
});
