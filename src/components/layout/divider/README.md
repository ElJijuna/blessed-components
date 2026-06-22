# Divider

Horizontal or vertical terminal separator with optional safe label.

## Features

- Horizontal and vertical orientation.
- Fixed cell or row length.
- Optional horizontal label.
- Start, center, and end label alignment.
- Unicode defaults and automatic ASCII adapter fallback.
- Custom one-cell drawing characters.
- Shared Box theming and no-color behavior.
- Pure renderer plus Blessed adapter.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderDivider } from 'blessed-components/divider';

renderDivider({
  label: 'Services',
  length: 24,
});
// "─────── Services ────────"
```

Output always occupies exactly `length` terminal cells. ANSI sequences and
Blessed tags are removed from labels. Wide Unicode labels are measured by
terminal cells.

### Label alignment

```ts
renderDivider({
  label: 'Details',
  labelAlign: 'start',
  length: 20,
});
// "Details ────────────"
```

`labelAlign` supports `start`, `center`, and `end`. Labels require horizontal
orientation.

### Vertical

```ts
renderDivider({
  length: 3,
  orientation: 'vertical',
});
// │
// │
// │
```

### ASCII

```ts
renderDivider({
  characters: {
    horizontal: '-',
    vertical: '|',
  },
  length: 8,
});
// "--------"
```

Drawing characters must each occupy one terminal cell.

## Blessed adapter

```ts
import { divider } from 'blessed-components/divider/blessed';

const separator = divider({
  parent: screen,
  box: {
    top: 4,
    left: 2,
    width: 40,
    height: 1,
  },
  data: {
    label: 'Metrics',
    tone: 'muted',
  },
});

screen.render();
```

When `length` is omitted, horizontal Divider uses inner element width and
vertical Divider uses inner element height. Border and padding are excluded.

## Terminal capabilities

Adapter chooses:

- Unicode: `─` and `│`
- ASCII: `-` and `|`

Selection follows detected terminal Unicode support. Pass `capabilities` for
deterministic tests or `characters` for explicit output.

## Theming

Default foreground tone is `border`. Divider supports Box theme fields:

- `tone`
- `backgroundTone`
- `borderTone`
- `theme`
- `capabilities`

Explicit Blessed styles win. Semantic colors become undefined in no-color
mode.

## Accessibility

- Divider is display-only and receives no focus.
- Labels remain literal and visible without color.
- Do not rely on Divider alone to communicate hierarchy.
- Reading order remains unchanged.

## Lifecycle

Adapter returns `element`, `setData()`, and `destroy()`. It never calls
`screen.render()`.

## Tree shaking

```ts
import { renderDivider } from 'blessed-components/divider';
import { divider } from 'blessed-components/divider/blessed';
```
