import { describe, expect, it } from 'vitest';

import { renderButton } from '@/index.js';

describe('Button', () => {
  it('renders a terminal action with visible boundaries', () => {
    expect(renderButton({ label: 'Deploy' })).toBe('[ Deploy ]');
  });

  it('communicates focus and disabled state without relying on color', () => {
    expect(renderButton({ disabled: true, focused: true, label: 'Delete' })).toBe(
      '› [ Delete ] (disabled)',
    );
  });

  it('supports plain output and sanitizes dynamic labels', () => {
    expect(
      renderButton({
        label: '\u001B[31m{bold}Cancel{/bold}\u001B[0m',
        variant: 'plain',
      }),
    ).toBe('Cancel');
  });

  it('rejects empty and multiline labels', () => {
    expect(() => renderButton({ label: '' })).toThrow(RangeError);
    expect(() => renderButton({ label: 'Deploy\nnow' })).toThrow(RangeError);
  });
});
