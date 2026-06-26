# Trend

`Trend` renders a one-line directional change indicator. It supports symbolic,
text-only, and symbol-plus-text modes so compact displays can still offer a
plain-text fallback when needed.

```ts
import { renderTrend } from 'blessed-components/trend';

renderTrend({
  direction: 'up',
  value: '12.5%',
  label: 'vs last month',
});
// "↑ 12.5% vs last month"
```

```ts
import blessed from 'blessed';
import { trend } from 'blessed-components/trend/blessed';

const screen = blessed.screen({ smartCSR: true });
const revenue = trend({
  parent: screen,
  box: { top: 0, left: 0, width: 24, height: 1 },
  data: {
    direction: 'up',
    value: '12.5%',
    label: 'vs last month',
  },
});

screen.render();
revenue.destroy();
screen.destroy();
```

The Blessed adapter derives foreground color from direction by default:
`success` for `up`, `danger` for `down`, and `muted` for `flat`.
