import { renderPlainLines } from '@/components/shared/text.js';

/** Notification tone. */
export type NotificationTone = 'error' | 'info' | 'success' | 'warning';

/** Notification row. */
export interface NotificationCenterItem {
  /** Notification body. */
  message: string;

  /** Stable id. */
  id: string;

  /** Whether notification is unread. */
  unread?: boolean;

  /** Optional tone. */
  tone?: NotificationTone;
}

/** Options accepted by {@link renderNotificationCenter}. */
export interface RenderNotificationCenterOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Notifications in visual order. */
  notifications: readonly NotificationCenterItem[];

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders persistent notifications with unread count. */
export function renderNotificationCenter({
  height,
  notifications,
  width,
}: RenderNotificationCenterOptions): string {
  const unread = notifications.filter((notification) => notification.unread).length;
  const lines = [
    `notifications: ${notifications.length} (${unread} unread)`,
    ...notifications.map((notification) => {
      const marker = notification.unread ? '*' : ' ';
      const tone = notification.tone ?? 'info';

      return `${marker} ${tone}: ${notification.message}`;
    }),
  ];

  return renderPlainLines(lines, { height, width });
}
