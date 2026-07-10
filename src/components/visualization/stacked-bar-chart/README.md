# StackedBarChart

Renders category composition across multiple segments.

```ts
import { renderStackedBarChart } from 'blessed-components';

renderStackedBarChart({
  width: 10,
  items: [{ label: 'api', segments: [{ label: 'ok', value: 7 }, { label: 'err', value: 3 }] }],
});
```

## API

`renderStackedBarChart(options)` accepts `items`, `width`, optional `characters`, and `height`.

## Accessibility

Totals are rendered as text. Adapters should add legends for segment labels.
