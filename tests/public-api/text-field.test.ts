import { describe, expect, it } from 'vitest';

import { renderTextField } from '@/index.js';

describe('TextField', () => {
  it('renders label, required marker, placeholder, and hint', () => {
    expect(
      renderTextField({
        hint: 'Used by deploy commands',
        label: 'Environment',
        placeholder: 'production',
        required: true,
        value: '',
        width: 24,
      }),
    ).toBe('Environment *:\nproduction\n? Used by deploy comman…');
  });

  it('renders focused value and error before hint', () => {
    expect(
      renderTextField({
        error: 'Use lowercase letters',
        focused: true,
        hint: 'Ignored when invalid',
        label: 'Slug',
        value: 'Prod API',
        width: 18,
      }),
    ).toBe('Slug:\n› Prod API\n! Use lowercase l…');
  });

  it('sanitizes markup and rejects invalid input', () => {
    expect(
      renderTextField({
        label: '{bold}Name{/bold}',
        value: '{red-fg}Ada{/red-fg}',
        width: 12,
      }),
    ).toBe('Name:\nAda');

    expect(() => renderTextField({ label: 'Name', value: 'Ada\nLovelace', width: 12 })).toThrow(
      RangeError,
    );
    expect(() => renderTextField({ label: 'Name', width: -1 })).toThrow(RangeError);
  });
});
