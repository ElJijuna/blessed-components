# ScatterPlot

Renders x/y points on a fixed terminal grid.

```ts
import { renderScatterPlot } from 'blessed-components';

renderScatterPlot({ width: 8, height: 4, points: [{ x: 1, y: 2 }] });
```

## API

`renderScatterPlot(options)` accepts `points`, `width`, `height`, optional `xDomain`, and `yDomain`.

## Accessibility

Adapters should expose point labels and values outside glyph-only plots.
