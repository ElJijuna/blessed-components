import { describe, expect, it } from 'vitest';

import { renderCheckbox } from '@/index.js';

describe('Checkbox', () => {
  it('renders focused, checked, disabled, safe text, and width truncation', () => {
    expect(
      renderCheckbox({
        checked: true,
        disabled: true,
        focused: true,
        label: '{bold}Include prereleases{/bold}',
        width: 30,
      }),
    ).toBe('› [x] Include prereleases (di…');
  });

  it('renders unchecked and indeterminate states', () => {
    expect(renderCheckbox({ label: 'Notify maintainers' })).toBe('[ ] Notify maintainers');
    expect(renderCheckbox({ checked: 'indeterminate', label: 'Select all' })).toBe(
      '[-] Select all',
    );
  });

  it('rejects invalid width and labels', () => {
    expect(() => renderCheckbox({ label: 'Name', width: -1 })).toThrow(RangeError);
    expect(() => renderCheckbox({ label: '' })).toThrow(RangeError);
    expect(() => renderCheckbox({ label: 'Bad\nLabel' })).toThrow(RangeError);
  });
});
