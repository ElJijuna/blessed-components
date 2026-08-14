# Banner

Render a full-width persistent alert for application-level state.

## Features

- Pure renderer and stateful Blessed adapter.
- Neutral, info, success, warning, and danger tones.
- Unicode markers with automatic ASCII fallback.
- Optional title and right-aligned action hint.
- Width-aware wrapping and exact-width line padding.
- ANSI and Blessed-tag sanitization.

## Pure renderer

```ts
import { renderBanner } from 'blessed-components/banner';

renderBanner({
  action: 'Details',
  message: 'Deployments are temporarily paused',
  title: 'Maintenance',
  tone: 'warning',
  width: 60,
});
```

`message` must contain visible text. `marker` and every custom marker must
occupy exactly one terminal cell. When `width` is supplied, every returned line
is padded to that width.

## Blessed adapter

```ts
import { banner } from 'blessed-components/banner/blessed';

const notice = banner({
  parent: screen,
  box: { top: 0, left: 0, width: '100%', height: 1 },
  data: { message: 'Connected', tone: 'success' },
});

notice.setData({ message: 'Connection lost', tone: 'danger' });
notice.destroy();
```

The adapter derives numeric width from its Blessed element, uses the tone as
the background color, and never calls `screen.render()` itself.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `message` | `string` | required | App-level status message. |
| `title` | `string` | `undefined` | Short heading before the message. |
| `action` | `string` | `undefined` | Action hint aligned to the first line. |
| `tone` | `BannerTone` | `'info'` | Semantic tone. |
| `width` | `number` | `undefined` | Exact rendered line width. |
| `showMarker` | `boolean` | `true` | Show the semantic marker. |
| `marker` | `string` | `undefined` | Explicit one-cell marker. |
| `markers` | `BannerMarkers` | Unicode defaults | Marker mapping by tone. |
