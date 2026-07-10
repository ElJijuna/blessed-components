# Calendar

Renders a simple month calendar.

```ts
import { renderCalendar } from 'blessed-components';

renderCalendar({ year: 2026, month: 7, selectedDate: '2026-07-10' });
```

## API

`renderCalendar(options)` accepts `year`, `month`, and optional `selectedDate`.

## Accessibility

Selected date is bracketed in text. Adapters should add keyboard navigation and announced date labels.
