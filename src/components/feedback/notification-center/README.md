# NotificationCenter

Renders persistent notifications and unread count.

```ts
import { renderNotificationCenter } from 'blessed-components';

renderNotificationCenter({
  notifications: [{ id: 'build', tone: 'success', message: 'Build passed', unread: true }],
});
```

## API

`renderNotificationCenter(options)` accepts `notifications`, optional `width`, and `height`.

## Accessibility

Unread state renders as text count plus row marker; tone is visible as text before color.
