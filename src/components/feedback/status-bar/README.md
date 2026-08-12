# StatusBar

Render a persistent one-line application status footer.

## Features

- Pure renderer with no Blessed import.
- Blessed adapter with `setData()` and `destroy()`.
- Left, center, and right status sections.
- Optional message text after left-side items.
- Width-aware truncation and padding.
- Unicode separators with automatic ASCII adapter fallback.
- Safe labels, details, messages, and markers.
- Shared Box theming.
- Tree-shakable subpath exports.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderStatusBar } from 'blessed-components/status-bar';

renderStatusBar({
  width: 48,
  items: [
    { label: 'NORMAL', section: 'left' },
    { label: 'main', marker: '●', section: 'center' },
    { label: 'Ready', detail: '3 jobs', section: 'right' },
  ],
});
```

StatusBar returns one line padded to `width` by default.

## Blessed adapter

```ts
import { statusBar } from 'blessed-components/status-bar/blessed';

const footer = statusBar({
  parent: screen,
  box: {
    bottom: 0,
    height: 1,
    width: '100%',
  },
  data: {
    items: [
      { label: 'NORMAL' },
      { label: 'API', detail: 'online', marker: '+', section: 'right' },
    ],
    message: 'Ready',
  },
});

screen.render();

footer.setData({
  items: [{ label: 'INSERT' }],
  message: 'Editing config',
});
screen.render();

footer.destroy();
```

The adapter derives width from the Blessed element when `width` is omitted and
never calls `screen.render()` itself.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `width` | `number` | required | Available width in terminal cells. |
| `items` | `StatusBarItem[]` | `[]` | Items grouped into left, center, and right sections. |
| `message` | `string` | `undefined` | Optional one-line message rendered after left items. |
| `characters` | `StatusBarCharacters` | Unicode defaults | Separators used between items. |
| `pad` | `boolean` | `true` | Whether to pad output to exactly `width` cells. |

## Item API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | required | Primary item text. Empty sanitized labels are omitted. |
| `detail` | `string` | `undefined` | Optional detail rendered after the label. |
| `marker` | `string` | `undefined` | Optional one-cell marker rendered before the label. |
| `section` | `'left' \\| 'center' \\| 'right'` | `'left'` | StatusBar section receiving the item. |

Labels, details, and messages are stripped of ANSI sequences and Blessed tags.

## Theming

The Blessed adapter uses the `foreground`, `background`, and `border` semantic
tokens by default. It also supports:

- `foregroundTone`
- `backgroundTone`
- `borderTone`
- `theme`
- `capabilities`

Explicit Blessed styles win. No-color mode removes semantic colors.

## Tree shaking

```ts
import { renderStatusBar } from 'blessed-components/status-bar';
import { statusBar } from 'blessed-components/status-bar/blessed';
```
