# Status

Render one inline semantic state with an optional detail.

## Features

- Pure renderer with no Blessed import.
- Blessed adapter with `setData()` and `destroy()`.
- Neutral, info, success, warning, and danger tones.
- Unicode markers with automatic ASCII adapter fallback.
- Safe label and detail text.
- Shared Box theming.
- Tree-shakable subpath exports.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderStatus } from 'blessed-components/status';

renderStatus({
  label: 'Healthy',
  detail: '24ms',
  tone: 'success',
});

// "✓ Healthy - 24ms"
```

Labels and details are stripped of ANSI sequences and Blessed tags.

## ASCII mode

```ts
import { STATUS_ASCII_MARKERS, renderStatus } from 'blessed-components/status';

renderStatus({
  label: 'Offline',
  markers: STATUS_ASCII_MARKERS,
  tone: 'danger',
});

// "x Offline"
```

Markers must occupy exactly one terminal cell.

## Blessed adapter

```ts
import { status } from 'blessed-components/status/blessed';

const health = status({
  parent: screen,
  box: {
    top: 0,
    left: 0,
    width: 30,
    height: 1,
  },
  data: {
    label: 'Healthy',
    detail: '24ms',
    tone: 'success',
  },
});

screen.render();

health.setData({
  label: 'Degraded',
  detail: 'retrying',
  tone: 'warning',
});
screen.render();

health.destroy();
```

The adapter updates element content but never calls `screen.render()` itself.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | Required | Non-empty primary status text. |
| `detail` | `string` | `undefined` | Optional secondary status text. |
| `detailSeparator` | `string` | `' - '` | Text between label and detail. |
| `tone` | `StatusTone` | `'neutral'` | Semantic status tone. |
| `showMarker` | `boolean` | `true` | Whether to render semantic marker. |
| `marker` | `string` | `undefined` | Explicit one-cell marker. |
| `markers` | `StatusMarkers` | Unicode defaults | Marker for each tone. |

## Theming

The Blessed adapter uses the status tone as foreground color. Neutral maps to
the theme foreground token. It also supports:

- `foregroundTone`
- `backgroundTone`
- `borderTone`
- `theme`
- `capabilities`

Explicit Blessed styles win. No-color mode removes semantic colors.

## Tree shaking

```ts
import { renderStatus } from 'blessed-components/status';
import { status } from 'blessed-components/status/blessed';
```
