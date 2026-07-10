import { describe, expect, it } from 'vitest';

import { renderRichText } from '@/index.js';

describe('RichText', () => {
  it('renders spans as contiguous text', () => {
    expect(renderRichText({ spans: [{ text: 'Hello' }, { text: ' world', tone: 'muted' }] })).toBe(
      'Hello world',
    );
  });
});
