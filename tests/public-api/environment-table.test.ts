import { describe, expect, it } from 'vitest';

import { renderEnvironmentTable } from '@/index.js';

describe('EnvironmentTable', () => {
  it('renders aligned variables and masks secrets', () => {
    expect(
      renderEnvironmentTable({
        items: [
          { name: 'NODE_ENV', value: 'test' },
          { name: 'TOKEN', secret: true, value: 'secret' },
        ],
      }),
    ).toBe(['KEY      VALUE', 'NODE_ENV test', 'TOKEN    ********'].join('\n'));
  });
});
