import { describe, expect, it } from 'vitest';

import { renderTag } from '@/index.js';

describe('Tag', () => {
  it('renders hash-prefixed categorization text by default', () => {
    expect(renderTag({ text: 'production' })).toBe('#production');
  });

  it('supports plain and bracketed variants', () => {
    expect(renderTag({ text: 'production', variant: 'plain' })).toBe('production');
    expect(renderTag({ text: 'production', variant: 'bracketed' })).toBe('[production]');
  });

  it('renders removable tags with a visible remove marker', () => {
    expect(renderTag({ removable: true, text: 'region:us-east' })).toBe('#region:us-east ×');
    expect(
      renderTag({
        removable: true,
        removeMarker: 'x',
        text: 'region:us-east',
        variant: 'bracketed',
      }),
    ).toBe('[region:us-east x]');
  });

  it('supports custom prefixes and delimiters', () => {
    expect(renderTag({ prefix: '@', text: 'owner' })).toBe('@owner');
    expect(
      renderTag({
        delimiters: { close: '}', open: '{' },
        text: 'team:infra',
        variant: 'bracketed',
      }),
    ).toBe('{team:infra}');
  });

  it('sanitizes terminal markup and supports Text layout options', () => {
    expect(
      renderTag({
        overflow: 'truncate',
        removable: true,
        text: '\u001B[31m{bold}production{/bold}\u001B[0m',
        width: 12,
      }),
    ).toBe('#production…');
  });

  it('rejects invalid text, delimiters, prefixes, markers, and dimensions', () => {
    expect(() => renderTag({ text: '' })).toThrow(RangeError);
    expect(() => renderTag({ prefix: '', text: 'production' })).toThrow(RangeError);
    expect(() =>
      renderTag({
        delimiters: { close: ']', open: '' },
        text: 'production',
        variant: 'bracketed',
      }),
    ).toThrow(RangeError);
    expect(() => renderTag({ removable: true, removeMarker: '', text: 'production' })).toThrow(
      RangeError,
    );
    expect(() => renderTag({ text: 'production', width: -1 })).toThrow(RangeError);
  });
});
