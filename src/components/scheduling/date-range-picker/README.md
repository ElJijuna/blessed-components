# DateRangePicker

Renders a bounded date interval preview.

```ts
import { renderDateRangePicker } from 'blessed-components';

renderDateRangePicker({ start: '2026-07-01', end: '2026-07-10' });
```

## API

`renderDateRangePicker(options)` accepts optional `start`, `end`, `width`, and `height`.

## Accessibility

Start and end labels are explicit, so selection state does not depend on layout alone.
