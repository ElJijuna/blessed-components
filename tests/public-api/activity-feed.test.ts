import { describe, expect, it } from 'vitest';

import { renderActivityFeed } from '@/index.js';

describe('ActivityFeed', () => {
  it('renders activity rows with markers, timestamps, and sanitized detail', () => {
    expect(
      renderActivityFeed({
        height: 2,
        items: [
          { detail: '{red-fg}done{/red-fg}', id: '1', label: 'Deploy', tone: 'success' },
          { id: '2', label: 'Retry', timestamp: '10:30', tone: 'warning' },
        ],
        width: 40,
      }),
    ).toBe('✓ Deploy - done\n! [10:30] Retry');
  });
});
