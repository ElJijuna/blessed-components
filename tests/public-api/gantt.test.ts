import { describe, expect, it } from 'vitest';

import { renderGantt } from '@/index.js';

describe('Gantt', () => {
  it('renders task spans on fixed track', () => {
    expect(
      renderGantt({ max: 4, min: 0, tasks: [{ end: 3, label: 'build', start: 1 }], width: 5 }),
    ).toBe('build |  ### ');
  });
});
