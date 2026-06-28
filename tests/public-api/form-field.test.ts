import { describe, expect, it } from 'vitest';

import { renderFormField } from '@/index.js';

describe('FormField', () => {
  it('renders label, required indicator, safe control, and hint', () => {
    expect(
      renderFormField({
        control: '{bold}[ production ]{/bold}',
        hint: 'Used for deploy targets',
        label: 'Environment',
        required: true,
        width: 24,
      }),
    ).toBe('Environment *:\n[ production ]\n? Used for deploy targe…');
  });

  it('renders error before hint and respects height', () => {
    expect(
      renderFormField({
        control: 'production',
        error: 'Select a writable environment',
        height: 3,
        hint: 'Ignored when invalid',
        label: 'Environment',
        width: 18,
      }),
    ).toBe('Environment:\nproduction\n! Select a writab…');
  });

  it('rejects invalid dimensions', () => {
    expect(() => renderFormField({ control: 'x', label: 'Name', width: -1 })).toThrow(RangeError);
    expect(() => renderFormField({ control: 'x', height: -1, label: 'Name', width: 10 })).toThrow(
      RangeError,
    );
  });
});
