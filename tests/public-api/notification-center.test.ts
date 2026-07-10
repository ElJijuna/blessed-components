import { describe, expect, it } from 'vitest';

import { renderNotificationCenter } from '@/index.js';

describe('NotificationCenter', () => {
  it('renders unread count and rows', () => {
    expect(
      renderNotificationCenter({
        notifications: [{ id: 'build', message: 'Build passed', tone: 'success', unread: true }],
      }),
    ).toBe(['notifications: 1 (1 unread)', '* success: Build passed'].join('\n'));
  });
});
