import { describe, expect, it } from 'vitest';

import { renderTaskRunner } from '@/index.js';

describe('TaskRunner', () => {
  it('renders active task state', () => {
    expect(
      renderTaskRunner({ activeTask: 'build', tasks: [{ name: 'build', status: 'running' }] }),
    ).toBe('> running build');
  });
});
