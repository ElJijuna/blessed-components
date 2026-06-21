# Stat

Display one important metric with an optional unit, trend, and supporting
description.

## Features

- Pure renderer with no Blessed import.
- Blessed adapter with explicit update and destroy lifecycle.
- Stacked and compact inline layouts.
- Optional units with configurable separator.
- Up, down, and flat trends.
- Custom trend characters for ASCII terminals.
- Optional description.
- Dedicated tree-shakable subpath exports.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderStat } from 'blessed-components/stat';

renderStat({
  label: 'Downloads',
  value: '25.2M',
});

// Downloads
// 25.2M
```

### Unit and description

```ts
renderStat({
  description: 'Across all packages',
  label: 'Storage',
  unit: 'GB',
  unitSeparator: ' ',
  value: 42,
});

// Storage
// 42 GB
// Across all packages
```

### Trend

```ts
renderStat({
  label: 'Revenue',
  trend: {
    direction: 'up',
    label: 'vs last month',
    value: '12.5%',
  },
  value: '$84K',
});

// Revenue
// $84K ↑ 12.5% vs last month
```

### Compact layout

```ts
renderStat({
  label: 'Overall',
  layout: 'inline',
  unit: '%',
  value: 85,
});

// Overall 85%
```

### ASCII trend characters

```ts
renderStat({
  label: 'Latency',
  trend: {
    direction: 'down',
    value: '8ms',
  },
  trendCharacters: {
    up: '^',
    down: 'v',
    flat: '-',
  },
  value: '120ms',
});
```

## Blessed adapter

```ts
import blessed from 'blessed';
import { stat } from 'blessed-components/stat/blessed';

const screen = blessed.screen({ smartCSR: true });
const revenue = stat({
  parent: screen,
  box: {
    top: 0,
    left: 0,
    width: 40,
    height: 3,
  },
  data: {
    label: 'Revenue',
    value: '$84K',
    trend: {
      direction: 'up',
      value: '12.5%',
    },
  },
});

screen.render();

revenue.setData({
  label: 'Revenue',
  value: '$91K',
  trend: {
    direction: 'up',
    value: '8.3%',
  },
});
screen.render();

revenue.destroy();
```

The adapter never calls `screen.render()`. Applications can batch multiple
updates into one render.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | Required | Metric label. |
| `value` | `string \| number` | Required | Primary metric value. |
| `unit` | `string` | — | Unit appended to the value. |
| `unitSeparator` | `string` | `''` | Separator between value and unit. |
| `description` | `string` | — | Supporting text rendered last. |
| `layout` | `'stacked' \| 'inline'` | `'stacked'` | Label/value arrangement. |
| `trend` | `StatTrend` | — | Direction, value, and optional label. |
| `trendCharacters` | `StatTrendCharacters` | `↑`, `↓`, `→` | Direction glyphs. |

Numeric values and numeric trend values must be finite.

## Adapter API

`stat(options)` accepts:

| Option | Type | Description |
| --- | --- | --- |
| `parent` | `blessed.Widgets.Node` | Parent Blessed node. |
| `data` | `RenderStatOptions` | Complete renderer data. |
| `box` | `StatBoxOptions` | Blessed box options excluding managed fields. |

It returns a `StatHandle` containing `element`, `setData()`, and `destroy()`.

## Terminal compatibility

- Include a label; do not expose an unexplained number.
- Trend direction must not rely on color alone.
- Use ASCII trend characters when Unicode arrows are unavailable.
- Text remains literal because the Blessed adapter disables tags.
- Stat is display-only and does not receive focus or keyboard input.

## Tree shaking

Use the pure subpath when no Blessed element is needed:

```ts
import { renderStat } from 'blessed-components/stat';
```

Import the adapter separately:

```ts
import { stat } from 'blessed-components/stat/blessed';
```
