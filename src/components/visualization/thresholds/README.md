# Thresholds

Qualitative numeric ranges shared by bounded visualizations.

```ts
import { renderThresholds, resolveThreshold } from 'blessed-components/thresholds';

const thresholds = [
  { end: 69, label: 'normal', tone: 'success' },
  { end: 89, label: 'warning', start: 70, tone: 'warning' },
  { label: 'critical', start: 90, tone: 'critical' },
] as const;

resolveThreshold({ max: 100, min: 0, thresholds, value: 72 });
renderThresholds({ max: 100, min: 0, thresholds, value: 72 });
```

The renderer includes text markers and brackets the active range so threshold
state remains visible in no-color terminals. Use `thresholds` from
`blessed-components/thresholds/blessed` for the Blessed adapter.
