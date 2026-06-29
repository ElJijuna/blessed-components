# Timestamp

`Timestamp` renders absolute or relative dates with the same safety and
terminal-cell layout rules as `Text`. The pure renderer returns plain text,
while the Blessed adapter uses the `muted` semantic foreground tone by default.

```ts
import { renderTimestamp } from 'blessed-components/timestamp';

renderTimestamp({
  value: '2026-06-29T15:30:00Z',
  timeZone: 'UTC',
  width: 18,
});
// "Jun 29, 2026, 3…"
```

```ts
import { renderTimestamp } from 'blessed-components/timestamp';

renderTimestamp({
  format: 'relative',
  now: '2026-06-29T16:00:00Z',
  value: '2026-06-29T15:30:00Z',
});
// "30 minutes ago"
```

```ts
import blessed from 'blessed';
import { timestamp } from 'blessed-components/timestamp/blessed';

const screen = blessed.screen({ smartCSR: true });
const updated = timestamp({
  parent: screen,
  box: { top: 0, left: 0, width: 24, height: 1 },
  data: {
    format: 'relative',
    value: new Date(),
  },
});

screen.render();
updated.destroy();
screen.destroy();
```

Use `Timestamp` for update times, event dates, log metadata, and other temporal
copy that should be formatted consistently before it reaches Blessed.
