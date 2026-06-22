import { describe, expect, it } from 'vitest';

import { renderProgressBar } from '@/index.js';

describe('ProgressBar', () => {
  it('renders a value as a fixed-width Unicode track', () => {
    expect(renderProgressBar({ value: 50, width: 10 })).toBe('█████░░░░░ 50%');
  });

  it('clamps values to the configured range', () => {
    expect(renderProgressBar({ value: 120, width: 5 })).toBe('█████ 100%');
  });

  it('scales custom numeric ranges into a percentage', () => {
    expect(renderProgressBar({ value: 15, min: 10, max: 20, width: 10 })).toBe('█████░░░░░ 50%');
  });

  it('renders an optional label and custom value text', () => {
    expect(
      renderProgressBar({
        formatValue: ({ value }) => `${value} files`,
        label: 'Uploaded',
        value: 25,
        width: 4,
      }),
    ).toBe('Uploaded █░░░ 25 files');
  });

  it('supports custom characters for ASCII terminals', () => {
    expect(
      renderProgressBar({
        characters: { empty: '-', filled: '#' },
        value: 50,
        width: 6,
      }),
    ).toBe('###--- 50%');
  });

  it('rejects invalid dimensions and ranges', () => {
    expect(() => renderProgressBar({ value: 50, width: 0 })).toThrow(RangeError);
    expect(() => renderProgressBar({ value: 50, min: 10, max: 10, width: 5 })).toThrow(RangeError);
  });
});
