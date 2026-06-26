# EmptyState

Render an empty result, first-run, or missing-data message.

## Features

- Pure renderer with no Blessed import.
- Blessed adapter with `setData()` and `destroy()`.
- Safe title, description, and action text.
- Optional one-cell marker.
- Width-aware wrapping and alignment.
- Optional height bounding.
- Shared Box theming.
- Tree-shakable subpath exports.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderEmptyState } from 'blessed-components/empty-state';

renderEmptyState({
  title: 'No projects',
  description: 'Create one to continue.',
  action: 'Press n to create',
  width: 32,
});
```

Title, description, and action are stripped of ANSI sequences and Blessed tags.

## Blessed adapter

```ts
import { emptyState } from 'blessed-components/empty-state/blessed';

const empty = emptyState({
  parent: screen,
  box: {
    top: 0,
    left: 0,
    width: 40,
    height: 7,
  },
  data: {
    title: 'No results',
    description: 'Try a different query.',
    action: 'Press / to search',
  },
});

screen.render();

empty.setData({
  title: 'No projects',
  description: 'Create one to continue.',
});
screen.render();

empty.destroy();
```

The adapter derives missing width and height from the Blessed element and
never calls `screen.render()` itself.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | Required | Non-empty primary empty-state message. |
| `description` | `string` | `undefined` | Optional detail text. |
| `action` | `string` | `undefined` | Optional action hint. |
| `width` | `number` | `undefined` | Maximum rendered cell width. |
| `height` | `number` | `undefined` | Maximum rendered line count. |
| `align` | `'left' \| 'center' \| 'right'` | `'center'` | Horizontal alignment. |
| `marker` | `string` | `'○'` | One-cell marker before the title. |
| `showMarker` | `boolean` | `true` | Whether to render the marker. |

## Theming

The Blessed adapter uses `muted` foreground by default. It also supports:

- `tone`
- `backgroundTone`
- `borderTone`
- `theme`
- `capabilities`

Explicit Blessed styles win. No-color mode removes semantic colors.

## Tree shaking

```ts
import { renderEmptyState } from 'blessed-components/empty-state';
import { emptyState } from 'blessed-components/empty-state/blessed';
```
