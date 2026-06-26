# StepIndicator

Render ordered process steps with completed, active, pending, and error states.

## Features

- Pure renderer with no Blessed import.
- Blessed adapter with `setData()` and `destroy()`.
- Vertical and horizontal layouts.
- Unicode markers with automatic ASCII adapter fallback.
- Safe labels and detail text.
- Width-aware vertical wrapping.
- Optional height bounding.
- Shared Box theming.
- Tree-shakable subpath exports.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderStepIndicator } from 'blessed-components/step-indicator';

renderStepIndicator({
  steps: [
    { id: 'install', label: 'Install', state: 'completed' },
    { id: 'build', label: 'Build', detail: 'compiling', state: 'active' },
    { id: 'deploy', label: 'Deploy' },
  ],
});

// "✓ Install"
// "● Build - compiling"
// "○ Deploy"
```

Labels and details are stripped of ANSI sequences and Blessed tags.

## Horizontal Layout

```ts
renderStepIndicator({
  orientation: 'horizontal',
  steps,
});
```

Horizontal output omits details and truncates when `width` is configured.

## Blessed Adapter

```ts
import { stepIndicator } from 'blessed-components/step-indicator/blessed';

const deploy = stepIndicator({
  parent: screen,
  box: {
    top: 0,
    left: 0,
    width: 40,
    height: 5,
  },
  data: {
    steps: [
      { id: 'install', label: 'Install', state: 'completed' },
      { id: 'build', label: 'Build', state: 'active' },
      { id: 'deploy', label: 'Deploy' },
    ],
  },
});

screen.render();

deploy.setData({
  steps: [
    { id: 'install', label: 'Install', state: 'completed' },
    { id: 'build', label: 'Build', state: 'completed' },
    { id: 'deploy', label: 'Deploy', state: 'active' },
  ],
});
screen.render();

deploy.destroy();
```

The adapter derives missing width and height from the Blessed element and
never calls `screen.render()` itself.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `steps` | `StepIndicatorStep[]` | Required | Ordered non-empty steps. |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout mode. |
| `width` | `number` | `undefined` | Maximum rendered cell width. |
| `height` | `number` | `undefined` | Maximum rendered line count. |
| `showDetail` | `boolean` | `true` | Whether detail text renders in vertical mode. |
| `detailSeparator` | `string` | `' - '` | Text between label and detail. |
| `separator` | `string` | `'  '` | Text between horizontal steps. |
| `markers` | `StepIndicatorMarkers` | Unicode defaults | Marker for each state. |

## Tree Shaking

```ts
import { renderStepIndicator } from 'blessed-components/step-indicator';
import { stepIndicator } from 'blessed-components/step-indicator/blessed';
```
