# Table

Typed, bounded table rendering for structured terminal data.

```ts
import { renderTable } from 'blessed-components/table';

renderTable({
  columns: [
    { header: 'Service', id: 'service' },
    { align: 'right', header: 'CPU', id: 'cpu', width: 5 },
  ],
  height: 5,
  rows: [
    { cpu: '42%', id: 'api', service: 'API' },
    { cpu: '8%', id: 'worker', service: 'Worker' },
  ],
  width: 32,
});
```

The pure renderer strips ANSI and Blessed tags from dynamic content, truncates
by terminal cell width, and exposes cursor, selected, and disabled states with
text markers so tables remain readable without color.

Use `table` from `blessed-components/table/blessed` for the interactive Blessed
adapter with Arrow Up/Down, Home/End, Page Up/Down, Enter, and Space support.
