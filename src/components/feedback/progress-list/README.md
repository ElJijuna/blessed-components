# ProgressList

Render multiple labeled progress rows with aligned labels, tracks, and values.

## Features

- Pure renderer with no Blessed import.
- Blessed adapter with `setData()` and `destroy()`.
- Shared numeric range defaults with per-row overrides.
- Unicode tracks with automatic ASCII adapter fallback.
- Safe labels and formatted values.
- Width-derived track sizing.
- Optional height bounding.
- Tree-shakable subpath exports.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderProgressList } from 'blessed-components/progress-list';

renderProgressList({
  items: [
    { id: 'api', label: 'API', value: 75 },
    { id: 'worker', label: 'Worker', value: 40 },
  ],
  trackWidth: 10,
});

// "API    ████████░░ 75%"
// "Worker ████░░░░░░ 40%"
```

Labels and formatted values are stripped of ANSI sequences and Blessed tags.

## Blessed Adapter

```ts
import { progressList } from 'blessed-components/progress-list/blessed';

const services = progressList({
  parent: screen,
  box: {
    top: 0,
    left: 0,
    width: 40,
    height: 3,
  },
  data: {
    items: [
      { id: 'api', label: 'API', value: 75 },
      { id: 'worker', label: 'Worker', value: 40 },
    ],
  },
});

screen.render();

services.setData({
  items: [
    { id: 'api', label: 'API', value: 100 },
    { id: 'worker', label: 'Worker', value: 88 },
  ],
});
screen.render();

services.destroy();
```

The adapter derives missing width and height from the Blessed element and
never calls `screen.render()` itself.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `ProgressListItem[]` | Required | Ordered non-empty rows. |
| `width` | `number` | `undefined` | Maximum rendered row width. |
| `height` | `number` | `undefined` | Maximum rendered line count. |
| `trackWidth` | `number` | Derived or `10` | Fixed track width. |
| `labelWidth` | `number` | Widest label | Fixed label width. |
| `min` | `number` | `0` | Default row lower bound. |
| `max` | `number` | `100` | Default row upper bound. |
| `formatValue` | `function` | Percent formatter | Default value formatter. |
| `showValue` | `boolean` | `true` | Whether value text renders. |
| `characters` | `ProgressBarCharacters` | Unicode defaults | Track characters. |

## Tree Shaking

```ts
import { renderProgressList } from 'blessed-components/progress-list';
import { progressList } from 'blessed-components/progress-list/blessed';
```
