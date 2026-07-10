# CandlestickChart

Renders OHLC financial rows with direction.

```ts
import { renderCandlestickChart } from 'blessed-components';

renderCandlestickChart({ points: [{ label: 'D1', open: 10, high: 12, low: 9, close: 11 }] });
```

## API

`renderCandlestickChart(options)` accepts `points`, optional `width`, and `height`.

## Accessibility

OHLC values render explicitly as text; directional wording is not color-only.
