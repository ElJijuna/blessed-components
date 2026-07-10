# VirtualTable

Renders a bounded row window from a large table dataset.

```ts
import { renderVirtualTable } from 'blessed-components';

renderVirtualTable({
  columns: [{ key: 'name' }, { key: 'cpu', header: 'CPU' }],
  rows: [{ name: 'api', cpu: '12%' }],
  rowCount: 10,
});
```

## API

`renderVirtualTable(options)` accepts `columns`, `rows`, `start`, `rowCount`, optional `width`, and `height`.

## Accessibility

Keep `start` and `rowCount` explicit so adapters can announce visible ranges and preserve focus when row windows move.
