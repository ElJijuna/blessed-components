# BarChart

Renders categorical numeric values as horizontal terminal bars.

```ts
import { renderBarChart } from 'blessed-components';

renderBarChart({
  width: 10,
  items: [
    { label: 'api', value: 6 },
    { label: 'web', value: 3 },
  ],
});
```

## API

`renderBarChart(options)` accepts `items`, `width`, optional `min`, `max`, `character`, and `height`.

## Accessibility

Each row includes text label and numeric value; bar glyphs are supplemental.
