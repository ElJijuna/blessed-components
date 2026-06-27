# Gauge

Single-value bounded gauge with optional qualitative thresholds.

```ts
import { renderGauge } from 'blessed-components/gauge';

renderGauge({
  label: 'CPU',
  thresholds: [
    { end: 69, label: 'normal' },
    { end: 89, label: 'warning', start: 70 },
    { label: 'critical', start: 90 },
  ],
  value: 72,
  width: 12,
});
```

The pure renderer clamps values into the configured range, renders a fixed-width
track, and appends the first matching threshold label as plain text so the
state remains visible without color.

Use `gauge` from `blessed-components/gauge/blessed` for the Blessed adapter.
