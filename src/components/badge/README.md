# Badge

Render compact semantic status text that remains meaningful without color.

## Features

- Pure renderer with no Blessed import.
- Blessed adapter with `setData()` and `destroy()`.
- Neutral, info, success, warning, and danger tones.
- Visible semantic markers by default.
- Bracketed and plain variants.
- Custom delimiters and ASCII markers.
- Optional marker hiding.
- Tree-shakable subpath exports.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderBadge } from 'blessed-components/badge';

renderBadge({
  text: 'Passed',
  tone: 'success',
});

// [✓ Passed]
```

## Semantic tones

```text
[• Ready]
[i Queued]
[✓ Passed]
[! Delayed]
[× Failed]
```

Markers ensure status is not communicated through color alone.

## Plain variant

```ts
renderBadge({
  text: 'Ready',
  variant: 'plain',
});

// • Ready
```

## ASCII mode

```ts
renderBadge({
  delimiters: {
    open: '<',
    close: '>',
  },
  markers: {
    neutral: '-',
    info: 'i',
    success: '+',
    warning: '!',
    danger: 'x',
  },
  text: 'Passed',
  tone: 'success',
});

// <+ Passed>
```

## Blessed adapter

```ts
import blessed from 'blessed';
import { badge } from 'blessed-components/badge/blessed';

const screen = blessed.screen({ smartCSR: true });
const status = badge({
  parent: screen,
  box: {
    top: 0,
    left: 0,
    width: 20,
    height: 1,
  },
  data: {
    text: 'Queued',
    tone: 'info',
  },
});

screen.render();

status.setData({
  text: 'Passed',
  tone: 'success',
});
screen.render();

status.destroy();
```

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | Required | Non-empty badge text. |
| `tone` | `BadgeTone` | `'neutral'` | Semantic status tone. |
| `variant` | `'bracketed' \| 'plain'` | `'bracketed'` | Delimiter behavior. |
| `showMarker` | `boolean` | `true` | Whether to render semantic marker. |
| `markers` | `BadgeMarkers` | Unicode defaults | Marker for each tone. |
| `delimiters` | `BadgeDelimiters` | `[` and `]` | Bracketed variant delimiters. |

Text, markers, and delimiters must be non-empty.

## Terminal compatibility

- Semantic markers make tones understandable without color.
- Use custom ASCII markers when Unicode support is unavailable.
- Prefer short badge text for narrow terminals.
- Blessed tags are disabled by the adapter.
- Badge is display-only and does not receive focus.

## Tree shaking

```ts
import { renderBadge } from 'blessed-components/badge';
import { badge } from 'blessed-components/badge/blessed';
```
