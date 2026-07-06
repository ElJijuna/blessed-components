import { describe, expect, it } from 'vitest';

import { renderIconButton } from '@/index.js';

describe('IconButton', () => {
  it('renders a compact terminal action with icon only', () => {
    expect(renderIconButton({ icon: '+', label: 'Create' })).toBe('[ + ]');
  });

  it('communicates focus and disabled state without relying on color', () => {
    expect(renderIconButton({ disabled: true, focused: true, icon: '×', label: 'Delete' })).toBe(
      '› [ × ] (Delete disabled)',
    );
  });

  it('supports visible labels, plain output, and sanitizes dynamic text', () => {
    expect(
      renderIconButton({
        icon: '\u001B[31m{bold}↻{/bold}\u001B[0m',
        label: '{bold}Refresh{/bold}',
        showLabel: true,
        variant: 'plain',
      }),
    ).toBe('↻ Refresh');
  });

  it('rejects empty and multiline icon or label values', () => {
    expect(() => renderIconButton({ icon: '', label: 'Create' })).toThrow(RangeError);
    expect(() => renderIconButton({ icon: '+', label: '' })).toThrow(RangeError);
    expect(() => renderIconButton({ icon: '+\n', label: 'Create' })).toThrow(RangeError);
    expect(() => renderIconButton({ icon: '+', label: 'Create\nnow' })).toThrow(RangeError);
  });
});
