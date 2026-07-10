import { describe, expect, it } from 'vitest';

import { renderBigText } from '@/index.js';

describe('BigText', () => {
  it('renders spaced uppercase fallback', () => {
    expect(renderBigText({ text: 'ok' })).toBe('O K');
  });
});
