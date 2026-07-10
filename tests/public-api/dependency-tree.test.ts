import { describe, expect, it } from 'vitest';

import { renderDependencyTree } from '@/index.js';

describe('DependencyTree', () => {
  it('renders nested dependencies and problems', () => {
    expect(
      renderDependencyTree({
        roots: [
          {
            children: [{ name: 'left-pad', problem: 'deprecated', version: '1.3.0' }],
            name: 'app',
          },
        ],
      }),
    ).toBe(['- app', '  - left-pad@1.3.0 ! deprecated'].join('\n'));
  });
});
