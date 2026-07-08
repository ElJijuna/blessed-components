import { describe, expect, it } from 'vitest';

import { renderTimer } from '@/index.js';

describe('Timer', () => {
  it('renders elapsed duration and paused state', () => {
    expect(renderTimer({ elapsed: 125_000, label: 'Build', paused: true, width: 30 })).toBe(
      'Build 2m 5s paused',
    );
  });
});
