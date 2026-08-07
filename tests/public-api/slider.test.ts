import { describe, expect, it } from 'vitest';

import { normalizeSliderValue, renderSlider } from '@/index.js';

describe('Slider', () => {
  it('renders a labeled fixed-width track and normalized value', () => {
    expect(renderSlider({ label: 'Volume', value: 40, width: 11 })).toBe(
      'Volume:\n  ━━━━●────── 40',
    );
  });

  it('renders focus, disabled, custom characters, and formatted values without color', () => {
    expect(
      renderSlider({
        characters: { disabled: 'x', empty: '-', filled: '=', focused: '>', thumb: 'o' },
        focused: true,
        formatValue: ({ percentage }) => `${percentage}%`,
        label: 'Gain',
        value: 0.5,
        max: 1,
        step: 0.1,
        width: 5,
      }),
    ).toBe('Gain:\n> ==o-- 50%');

    expect(renderSlider({ disabled: true, label: 'Gain', value: 0, width: 3 })).toBe(
      'Gain:\n× ●── 0 (disabled)',
    );
  });

  it('clamps and aligns values to decimal steps', () => {
    expect(normalizeSliderValue(3.14, { max: 5, min: 0, step: 0.25 })).toBe(3.25);
    expect(normalizeSliderValue(-10, { max: 5, min: 1, step: 2 })).toBe(1);
    expect(normalizeSliderValue(10, { max: 5, min: 1, step: 2 })).toBe(5);
  });

  it('sanitizes text and rejects invalid dimensions, ranges, values, and characters', () => {
    expect(
      renderSlider({
        formatValue: () => '{green-fg}5{/green-fg}',
        label: '{bold}Volume{/bold}',
        value: 5,
        width: 3,
      }),
    ).toBe('Volume:\n  ●── 5');

    expect(() => renderSlider({ label: 'Volume', value: 1, width: 0 })).toThrow(RangeError);
    expect(() => renderSlider({ label: 'Volume', max: 1, min: 1, value: 1, width: 2 })).toThrow(
      RangeError,
    );
    expect(() => renderSlider({ label: 'Volume', step: 0, value: 1, width: 2 })).toThrow(
      RangeError,
    );
    expect(() => renderSlider({ label: 'Volume', value: Number.NaN, width: 2 })).toThrow(
      RangeError,
    );
    expect(() =>
      renderSlider({
        characters: { disabled: 'x', empty: '--', filled: '=', focused: '>', thumb: 'o' },
        label: 'Volume',
        value: 1,
        width: 2,
      }),
    ).toThrow(RangeError);
  });
});
