# Alert

Render a semantic message with an optional title and description.

## Features

- Pure renderer with no Blessed import.
- Blessed adapter with `setData()` and `destroy()`.
- Neutral, info, success, warning, and danger tones.
- Unicode markers with automatic ASCII adapter fallback.
- Width-aware wrapping.
- Safe title and description text.
- Shared Box theming.
- Tree-shakable subpath exports.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderAlert } from 'blessed-components/alert';

renderAlert({
  title: 'Deploy delayed',
  description: 'Retrying in 10s',
  tone: 'warning',
});

// "! Deploy delayed"
// "  Retrying in 10s"
```

Title and description are stripped of ANSI sequences and Blessed tags.

## Wrapping

```ts
renderAlert({
  title: 'Warning',
  description: 'Retry deployment after health checks recover',
  tone: 'warning',
  width: 18,
});
```

Wrapped lines align with the alert text after the marker.

## Blessed adapter

```ts
import { alert } from 'blessed-components/alert/blessed';

const warning = alert({
  parent: screen,
  box: {
    top: 0,
    left: 0,
    width: 42,
    height: 4,
    border: 'line',
  },
  data: {
    title: 'Deploy delayed',
    description: 'Retrying in 10s',
    tone: 'warning',
  },
});

screen.render();

warning.setData({
  title: 'Deploy complete',
  description: 'All checks passed',
  tone: 'success',
});
screen.render();

warning.destroy();
```

The adapter derives width from the Blessed element when `width` is omitted and
never calls `screen.render()` itself.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | `undefined` | Optional primary alert text. |
| `description` | `string` | `undefined` | Optional detail text. |
| `tone` | `AlertTone` | `'info'` | Semantic alert tone. |
| `width` | `number` | `undefined` | Maximum rendered cell width. |
| `showMarker` | `boolean` | `true` | Whether to render semantic marker. |
| `marker` | `string` | `undefined` | Explicit one-cell marker. |
| `markers` | `AlertMarkers` | Unicode defaults | Marker for each tone. |

At least one of `title` or `description` must be non-empty.

## Theming

The Blessed adapter uses the alert tone for foreground and border color.
Neutral maps to the theme foreground token. It also supports:

- `foregroundTone`
- `backgroundTone`
- `borderTone`
- `theme`
- `capabilities`

Explicit Blessed styles win. No-color mode removes semantic colors.

## Tree shaking

```ts
import { renderAlert } from 'blessed-components/alert';
import { alert } from 'blessed-components/alert/blessed';
```
