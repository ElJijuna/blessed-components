# AreaChart

Renders one filled trend as sampled intensity cells.

```ts
import { renderAreaChart } from 'blessed-components';

renderAreaChart({ width: 8, values: [1, 3, 2, 7] });
```

## API

`renderAreaChart(options)` accepts `values`, `width`, optional `min`, `max`, and `height`.

## Accessibility

Use adjacent labels for exact values; area cells summarize trend shape.
