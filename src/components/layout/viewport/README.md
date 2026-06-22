# Viewport

Composable clipping window over content larger than the visible terminal
region.

## Features

- Headless two-dimensional offsets through the shared Viewport primitive.
- Blessed wrapper with one visible root and one composable content element.
- Horizontal and vertical scrolling.
- Clamped absolute and relative movement.
- Minimum-distance `ensureVisible()` behavior.
- Automatic remeasurement after terminal resize.
- Content-size updates that preserve valid offsets.
- Shared Box theme contract.

## Installation

```sh
npm install blessed blessed-components
```

## Pure layout

```ts
import { calculateViewportLayout } from 'blessed-components/viewport';

calculateViewportLayout({
  contentHeight: 20,
  contentWidth: 40,
  height: 5,
  width: 10,
  x: 7,
  y: 3,
});

// {
//   content: { height: 20, width: 40, left: -7, top: -3 },
//   visible: { height: 5, width: 10, x: 7, y: 3 },
// }
```

Use `createViewport` from `blessed-components/primitives/viewport` when only
headless state is needed.

## Blessed adapter

```ts
import blessed from 'blessed';
import { text } from 'blessed-components/text/blessed';
import { viewport } from 'blessed-components/viewport/blessed';

const screen = blessed.screen({ smartCSR: true });
const canvas = viewport({
  parent: screen,
  box: {
    top: 1,
    left: 2,
    width: 40,
    height: 10,
    border: 'line',
  },
  data: {
    contentWidth: 80,
    contentHeight: 30,
    borderTone: 'primary',
  },
});

text({
  parent: canvas.contentElement,
  box: {
    top: 15,
    left: 50,
    width: 20,
    height: 1,
  },
  data: {
    content: 'Remote content',
  },
});

canvas.ensureVisible({
  x: 50,
  y: 15,
  width: 20,
  height: 1,
});
screen.render();
```

Children use content coordinates and should be attached to `contentElement`,
not the outer `element`.

## Data API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `contentWidth` | `number` | Required | Total content width in cells. |
| `contentHeight` | `number` | Required | Total content height in rows. |
| `x` | `number` | `0` initially | Optional absolute horizontal offset. |
| `y` | `number` | `0` initially | Optional absolute vertical offset. |
| `foregroundTone` | `keyof ThemeColors` | `foreground` | Root foreground. |
| `backgroundTone` | `keyof ThemeColors` | `background` | Root background. |
| `borderTone` | `keyof ThemeColors` | `border` | Root border. |

Omitting `x` or `y` from later `setData()` calls preserves the current
offset. Reducing content size automatically reclamps it.

## Handle API

`viewport(options)` returns:

- `element`: visible clipping container.
- `contentElement`: translated parent for caller-owned children.
- `scrollTo({ x, y })`
- `scrollBy({ x, y })`
- `ensureVisible(rect)`
- `resize()`
- `snapshot()`
- `setData(data)`
- `destroy()`

The adapter never calls `screen.render()`.

## Tree shaking

```ts
import { calculateViewportLayout } from 'blessed-components/viewport';
import { viewport } from 'blessed-components/viewport/blessed';
```
