# MultiSparkline

Aligned compact sparklines for comparable series.

```ts
import { renderMultiSparkline } from 'blessed-components/multi-sparkline';

renderMultiSparkline({
  series: [
    { id: 'api', label: 'API', values: [1, 3, 5, 8] },
    { id: 'worker', label: 'Worker', values: [2, 2, 4, 6] },
  ],
  width: 8,
});
```

All rows share one numeric domain, so glyph intensity is comparable across
series. Labels are cell-width aware and aligned before each row delegates to
the same sparkline renderer used by `Sparkline`.

Use `multiSparkline` from `blessed-components/multi-sparkline/blessed` for the
Blessed adapter.
