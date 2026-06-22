import { describe, expect, it } from 'vitest';

import {
  cropText,
  escapeBlessedTags,
  stripBlessedTags,
  truncateText,
  visibleWidth,
  wrapText,
} from '@/core/index.js';

describe('core text utilities', () => {
  it('measures terminal cells while ignoring ANSI and Blessed tags', () => {
    expect(visibleWidth('\u001B[31m红色\u001B[0m')).toBe(4);
    expect(visibleWidth('{red-fg}ready{/red-fg}')).toBe(5);
  });

  it('escapes and strips Blessed tags', () => {
    expect(escapeBlessedTags('value {red-fg}')).toBe('value \\{red-fg}');
    expect(stripBlessedTags('{bold}ready{/bold}')).toBe('ready');
  });

  it('truncates by terminal width at the end, start, or middle', () => {
    expect(truncateText('abcdefgh', 5)).toBe('abcd…');
    expect(truncateText('abcdefgh', 5, { position: 'start' })).toBe('…efgh');
    expect(truncateText('abcdefgh', 5, { position: 'middle' })).toBe('ab…gh');
  });

  it('wraps text without splitting wide terminal cells', () => {
    expect(wrapText('ab红cd', 4)).toEqual(['ab红', 'cd']);
  });

  it('crops rows and columns using terminal cells', () => {
    expect(cropText('abcdef\n红色text', { height: 2, width: 4 })).toBe('abcd\n红色');
  });
});
