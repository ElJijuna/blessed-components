# ProgressStack

Render one segmented progress track across categories.

## Features

- Pure renderer with no Blessed import.
- Blessed adapter with `setData()` and `destroy()`.
- Proportional segment allocation that fills the configured width.
- Unicode segment characters with automatic ASCII adapter fallback.
- Optional legend rows with formatted values.
- Safe labels and formatted values.
- Optional height bounding.
- Tree-shakable subpath exports.

## Installation

```sh
npm install blessed blessed-components
```

## Pure Renderer

```ts
import { renderProgressStack } from 'blessed-components/progress-stack';

renderProgressStack({
  segments: [
    { id: 'passed', label: 'Passed', value: 30 },
    { id: 'failed', label: 'Failed', value: 10 },
  ],
  width: 10,
});

// "████████▓▓"
// "█ Passed 75%"
// "▓ Failed 25%"
```

Labels and formatted values are stripped of ANSI sequences and Blessed tags.

## Blessed Adapter

```ts
import { progressStack } from 'blessed-components/progress-stack/blessed';

const tests = progressStack({
  parent: screen,
  box: {
    top: 0,
    left: 0,
    width: 40,
    height: 4,
  },
  data: {
    segments: [
      { id: 'passed', label: 'Passed', value: 30 },
      { id: 'failed', label: 'Failed', value: 10 },
    ],
    width: 20,
  },
});

screen.render();

tests.setData({
  segments: [{ id: 'passed', label: 'Passed', value: 40 }],
  showLegend: false,
  width: 20,
});
screen.render();

tests.destroy();
```

The adapter chooses ASCII characters when Unicode is unavailable and never
calls `screen.render()` itself.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `segments` | `ProgressStackSegment[]` | Required | Ordered non-empty segments. |
| `width` | `number` | Required | Track width in terminal cells. |
| `total` | `number` | Segment sum | Full-track total. |
| `showLegend` | `boolean` | `true` | Whether legend rows render. |
| `height` | `number` | `undefined` | Maximum rendered line count. |
| `characters` | `string[]` | Unicode defaults | Segment characters. |
| `formatValue` | `function` | Percent formatter | Legend value formatter. |

## Tree Shaking

```ts
import { renderProgressStack } from 'blessed-components/progress-stack';
import { progressStack } from 'blessed-components/progress-stack/blessed';
```
