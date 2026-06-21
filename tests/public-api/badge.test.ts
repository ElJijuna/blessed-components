import { describe, expect, it } from 'vitest';

import { renderBadge } from '../../src/index.js';

describe('Badge', () => {
  it('renders neutral text inside a compact badge', () => {
    expect(renderBadge({ text: 'Ready' })).toBe('[• Ready]');
  });

  it('uses semantic markers that do not rely on color', () => {
    expect(renderBadge({ text: 'Passed', tone: 'success' })).toBe('[✓ Passed]');
    expect(renderBadge({ text: 'Delayed', tone: 'warning' })).toBe('[! Delayed]');
    expect(renderBadge({ text: 'Failed', tone: 'danger' })).toBe('[× Failed]');
    expect(renderBadge({ text: 'Queued', tone: 'info' })).toBe('[i Queued]');
  });

  it('supports plain text without delimiters', () => {
    expect(renderBadge({ text: 'Ready', variant: 'plain' })).toBe('• Ready');
  });

  it('can hide the semantic marker', () => {
    expect(renderBadge({ showMarker: false, text: 'Ready' })).toBe('[Ready]');
  });

  it('supports custom ASCII markers and delimiters', () => {
    expect(
      renderBadge({
        delimiters: { close: '>', open: '<' },
        markers: {
          danger: 'x',
          info: 'i',
          neutral: '-',
          success: '+',
          warning: '!',
        },
        text: 'Passed',
        tone: 'success',
      }),
    ).toBe('<+ Passed>');
  });

  it('rejects empty text, markers, and delimiters', () => {
    expect(() => renderBadge({ text: '' })).toThrow(RangeError);
    expect(() =>
      renderBadge({
        markers: {
          danger: 'x',
          info: 'i',
          neutral: '',
          success: '+',
          warning: '!',
        },
        text: 'Ready',
      }),
    ).toThrow(RangeError);
    expect(() =>
      renderBadge({
        delimiters: { close: ']', open: '' },
        text: 'Ready',
      }),
    ).toThrow(RangeError);
  });
});
