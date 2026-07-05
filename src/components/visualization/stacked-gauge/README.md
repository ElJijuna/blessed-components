# StackedGauge

StackedGauge renders multiple proportional values in one bounded gauge track.

Use it for compact part-to-whole summaries where categories should be visible
inside a single gauge instead of separate bars.

```ts
import { renderStackedGauge } from 'blessed-components/stacked-gauge';

renderStackedGauge({
  label: 'Capacity',
  segments: [
    { id: 'used', label: 'Used', value: 62 },
    { id: 'reserved', label: 'Reserved', value: 18 },
  ],
  total: 100,
  width: 20,
});
```
