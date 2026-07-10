# Heatmap

Renders a two-dimensional numeric matrix as terminal intensity cells.

```ts
import { renderHeatmap } from 'blessed-components';

renderHeatmap({ values: [[0, 1, 2], [2, 1, 0]] });
```

## API

`renderHeatmap(options)` accepts `values`, optional `min`, `max`, `characters`, `width`, and `height`.

## Accessibility

Use adjacent labels or legends in adapters when users need exact values; cell intensity is a visual summary.
