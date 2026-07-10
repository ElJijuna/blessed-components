# WaterfallChart

Renders sequential positive and negative contributions.

```ts
import { renderWaterfallChart } from 'blessed-components';

renderWaterfallChart({ start: 10, steps: [{ label: 'cost', value: -3 }] });
```

## API

`renderWaterfallChart(options)` accepts `steps`, optional `start`, `width`, and `height`.

## Accessibility

Each step includes signed value and running total in text.
