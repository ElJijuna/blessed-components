# BoxPlot

Renders statistical distribution summaries with min, quartiles, median, and max.

```ts
import { renderBoxPlot } from 'blessed-components';

renderBoxPlot({
  width: 12,
  items: [{ label: 'latency', min: 1, lowerQuartile: 2, median: 3, upperQuartile: 5, max: 8 }],
});
```

## API

`renderBoxPlot(options)` accepts `items`, `width`, and optional `height`.

## Accessibility

Use labels and numeric summaries alongside plots when exact values matter.
