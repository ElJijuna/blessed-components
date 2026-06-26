# TaskProgress

Render a task status summary with optional progress and steps.

## Features

- Pure renderer with no Blessed import.
- Blessed adapter with `setData()` and `destroy()`.
- Semantic task states: idle, running, success, warning, and error.
- Optional current activity text.
- Optional determinate progress bar.
- Optional step list.
- Unicode markers with automatic ASCII adapter fallback.
- Safe title, activity, and step text.
- Tree-shakable subpath exports.

## Installation

```sh
npm install blessed blessed-components
```

## Pure Renderer

```ts
import { renderTaskProgress } from 'blessed-components/task-progress';

renderTaskProgress({
  title: 'Release',
  activity: 'Running checks',
  value: 50,
  steps: [
    { id: 'install', label: 'Install', state: 'completed' },
    { id: 'test', label: 'Test', state: 'active' },
  ],
  width: 24,
});
```

The renderer is display-only. It does not execute tasks, own timers, or call
process APIs.

## Blessed Adapter

```ts
import { taskProgress } from 'blessed-components/task-progress/blessed';

const release = taskProgress({
  parent: screen,
  box: {
    top: 0,
    left: 0,
    width: 40,
    height: 6,
  },
  data: {
    title: 'Release',
    activity: 'Running checks',
    value: 50,
  },
});

screen.render();

release.setData({
  title: 'Release complete',
  status: 'success',
  showProgress: false,
});
screen.render();

release.destroy();
```

The adapter derives missing width and height from the Blessed element and
never calls `screen.render()` itself.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | Required | Non-empty task title. |
| `status` | `TaskProgressStatus` | `'running'` | Task status marker. |
| `activity` | `string` | `undefined` | Optional current activity. |
| `value` | `number` | `undefined` | Optional progress value. |
| `steps` | `StepIndicatorStep[]` | `undefined` | Optional steps. |
| `width` | `number` | `undefined` | Maximum rendered width. |
| `height` | `number` | `undefined` | Maximum rendered line count. |
| `showProgress` | `boolean` | `true` | Whether value renders as progress. |
| `showMarker` | `boolean` | `true` | Whether title marker renders. |

## Tree Shaking

```ts
import { renderTaskProgress } from 'blessed-components/task-progress';
import { taskProgress } from 'blessed-components/task-progress/blessed';
```
