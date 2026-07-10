# LineChart

Renders one or more sampled numeric series as compact terminal trend rows.

```ts
import { renderLineChart } from 'blessed-components';

renderLineChart({
  width: 8,
  series: [{ label: 'latency', values: [1, 3, 2, 6] }],
});
```

## API

`renderLineChart(options)` accepts `series`, `width`, optional `min`, `max`, and `height`.

## Accessibility

Series labels remain visible; glyph rows are compact visual summaries, not sole data source.
