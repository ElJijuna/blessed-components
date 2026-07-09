# Schedule

Renders ordered upcoming events with optional status text.

```ts
import { renderSchedule } from 'blessed-components';

renderSchedule({
  items: [{ id: 'build', label: 'Build', time: '2026-07-09T09:00:00.000Z' }],
});
```

## API

`renderSchedule(options)` sorts by event time, formats local time, and renders an empty state for no events.
