# QueryResults

Renders database result rows and execution metadata.

```ts
import { renderQueryResults } from 'blessed-components';

renderQueryResults({
  columns: [{ key: 'id' }],
  rows: [{ id: 1 }],
  durationMs: 12,
});
```

## API

`renderQueryResults(options)` accepts `columns`, `rows`, optional `durationMs`, `width`, and `height`.

## Accessibility

Headers and row counts render as text; adapters can add selection/focus later.
