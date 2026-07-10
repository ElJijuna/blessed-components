import { describe, expect, it } from 'vitest';

import { renderPill } from '@/index.js';

describe('Pill', () => {
  it('renders compact capped text', () => {
    expect(renderPill({ label: 'beta' })).toBe('( beta )');
  });
});
