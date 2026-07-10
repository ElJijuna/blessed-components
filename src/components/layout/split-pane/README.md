# SplitPane

Renders horizontal or vertical split region sizes as deterministic terminal text.

```ts
import { renderSplitPane } from 'blessed-components';

renderSplitPane({
  orientation: 'horizontal',
  regions: [
    { id: 'main', size: 80 },
    { id: 'logs', size: 32 },
  ],
});
```

## API

`renderSplitPane(options)` accepts ordered `regions`, optional `orientation`, `width`, and `height`.

## Accessibility

Expose each region with a stable `id` and readable `label` so adapters can map focus and resize shortcuts consistently.
