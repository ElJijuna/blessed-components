import { describe, expect, it } from 'vitest';

import { clampNumberFieldValue, parseNumberFieldInput, renderNumberField } from '@/index.js';

describe('NumberField', () => {
  it('renders label, value, stepper affordance, and hint', () => {
    expect(
      renderNumberField({
        hint: 'Use Up/Down',
        label: 'Replicas',
        max: 10,
        min: 0,
        required: true,
        value: 3,
        width: 24,
      }),
    ).toBe('Replicas *:\n3 -/+\n? Use Up/Down');
  });

  it('renders focused placeholder and error', () => {
    expect(
      renderNumberField({
        error: 'Must be between 1 and 10',
        focused: true,
        label: 'Replicas',
        placeholder: '1',
        width: 20,
      }),
    ).toBe('Replicas:\n> 1 -/+\n! Must be between 1…');
  });

  it('parses, clamps, sanitizes, and rejects invalid values', () => {
    expect(parseNumberFieldInput(' 4 ', { max: 5, min: 0 })).toEqual({
      input: '4',
      valid: true,
      value: 4,
    });
    expect(parseNumberFieldInput('9', { max: 5 })).toEqual({
      input: '9',
      reason: 'above-max',
      valid: false,
    });
    expect(clampNumberFieldValue(9, { max: 5, min: 0 })).toBe(5);
    expect(
      renderNumberField({
        label: '{bold}Replicas{/bold}',
        placeholder: '{gray-fg}auto{/gray-fg}',
        width: 16,
      }),
    ).toBe('Replicas:\nauto -/+');

    expect(() => parseNumberFieldInput('1\n2')).toThrow(RangeError);
    expect(() => renderNumberField({ label: 'Replicas', min: 3, max: 1, width: 12 })).toThrow(
      RangeError,
    );
    expect(() => renderNumberField({ label: 'Replicas', step: 0, width: 12 })).toThrow(RangeError);
    expect(() => renderNumberField({ label: 'Replicas', width: -1 })).toThrow(RangeError);
  });
});
