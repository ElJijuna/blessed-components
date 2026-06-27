# Legend

Series and category legend for terminal charts.

```ts
import { renderLegend } from 'blessed-components/legend';

renderLegend({
  items: [
    { id: 'api', label: 'API', marker: '●' },
    { id: 'worker', label: 'Worker', marker: '■' },
  ],
});
```

Markers are part of the text output, so legends remain useful without color.
The renderer strips ANSI and Blessed tags from dynamic text and can render
horizontal or vertical layouts.

Use `legend` from `blessed-components/legend/blessed` for the Blessed adapter.
