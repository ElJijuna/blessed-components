import { describe, expect, it } from 'vitest';

import { renderSkeleton } from '@/index.js';

describe('Skeleton', () => {
  it('renders placeholder rows with optional label', () => {
    expect(renderSkeleton({ label: 'Loading', rows: 2, width: 4 })).toBe(
      ['Loading', '----', '----'].join('\n'),
    );
  });
});
