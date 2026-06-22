# MetricBars

Render several labeled metrics as aligned horizontal progress bars.

## Features

- Pure renderer composed from `ProgressBar`.
- Blessed adapter with explicit update and destroy lifecycle.
- Shared numeric range across rows.
- Automatic label alignment.
- Optional overall heading and value.
- Custom value formatter with access to original metric data.
- Unicode and ASCII track characters.
- Empty-state output.
- Tree-shakable subpath exports.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderMetricBars } from 'blessed-components/metric-bars';

renderMetricBars({
  barWidth: 16,
  label: 'Overall',
  value: '85%',
  metrics: [
    { label: 'Quality', value: 78 },
    { label: 'Popularity', value: 99 },
    { label: 'Maintenance', value: 82 },
  ],
});
```

Output:

```text
Overall 85%

Quality     ████████████░░░░ 78%
Popularity  ████████████████ 99%
Maintenance █████████████░░░ 82%
```

## Custom range and ASCII

```ts
renderMetricBars({
  barWidth: 10,
  characters: { filled: '#', empty: '-' },
  min: 10,
  max: 20,
  metrics: [
    { label: 'Workers', value: 15 },
    { label: 'Queues', value: 12 },
  ],
});
```

## Typed metric metadata

Metric objects may contain additional fields. A custom formatter receives the
original typed object:

```ts
renderMetricBars({
  barWidth: 10,
  metrics: [{ label: 'Latency', value: 25, unit: 'ms' }],
  formatValue: ({ metric, value }) => `${value}${metric.unit}`,
});
```

## Blessed adapter

```ts
import blessed from 'blessed';
import { metricBars } from 'blessed-components/metric-bars/blessed';

const screen = blessed.screen({ smartCSR: true });
const score = metricBars({
  parent: screen,
  box: { top: 0, left: 0, width: 60, height: 6 },
  data: {
    barWidth: 16,
    label: 'Overall',
    tone: 'primary',
    value: '85%',
    metrics: [
      { label: 'Quality', value: 78 },
      { label: 'Popularity', value: 99 },
    ],
  },
});

screen.render();

score.setData({
  barWidth: 16,
  label: 'Overall',
  value: '90%',
  metrics: [
    { label: 'Quality', value: 85 },
    { label: 'Popularity', value: 99 },
  ],
});
screen.render();

score.destroy();
```

### Semantic colors

MetricBars uses the shared Box theme contract:

```ts
score.setData({
  barWidth: 16,
  metrics: [
    { label: 'Quality', value: 85 },
    { label: 'Popularity', value: 99 },
  ],
  theme,
  tone: 'success',
  value: '90%',
});
```

`tone` controls foreground color. `backgroundTone` and `borderTone` are also
available. Explicit Blessed styles win. Semantic colors become undefined in
no-color mode.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `barWidth` | `number` | Required | Track width shared by every row. |
| `metrics` | `readonly MetricBarItem[]` | Required | Ordered labeled metrics. |
| `min` | `number` | `0` | Shared lower bound. |
| `max` | `number` | `100` | Shared upper bound. |
| `characters` | `ProgressBarCharacters` | `█`, `░` | Shared track characters. |
| `label` | `string` | — | Overall heading label. |
| `value` | `string \| number` | — | Overall heading value. |
| `formatValue` | `(context) => string` | Percentage | Per-row value formatter. |
| `emptyText` | `string` | `No metrics` | Output when metrics are empty. |

Adapter `MetricBarsData<TMetric>` adds `tone`, `backgroundTone`, `borderTone`,
`theme`, and `capabilities` to renderer data.

Rows remain in input order. Labels are padded to the longest label, and values
are clamped through the same `ProgressBar` contract.

## Terminal compatibility

- Use ASCII characters when Unicode block glyphs are unavailable.
- Include value text; bar length must not be the only source of meaning.
- Keep labels concise for narrow terminals.
- Blessed tags are disabled by the adapter.
- The component is display-only and does not receive focus.

## Tree shaking

```ts
import { renderMetricBars } from 'blessed-components/metric-bars';
import { metricBars } from 'blessed-components/metric-bars/blessed';
```
