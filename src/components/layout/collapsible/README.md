# Collapsible

Show or hide a body region while keeping its Blessed children mounted.

## Features

- Pure header renderer with no Blessed import.
- Deterministic layout calculator for expanded and collapsed states.
- Controlled and uncontrolled Blessed adapter.
- Keyboard and mouse toggling through the header.
- Body element stays mounted while collapsed.
- Shared Box theme contract for root styling.

## Installation

```sh
npm install blessed blessed-components
```

## Pure utilities

```ts
import {
  calculateCollapsibleLayout,
  renderCollapsibleHeader,
} from 'blessed-components/collapsible';

renderCollapsibleHeader({
  expanded: true,
  title: 'Filters',
});
// ▾ Filters

calculateCollapsibleLayout({
  bodyHeight: 4,
  expanded: true,
  gap: 1,
});
// { headerHeight: 1, bodyTop: 2, bodyHeight: 4, bodyVisible: true, totalHeight: 6 }
```

## Blessed adapter

```ts
import blessed from 'blessed';
import { collapsible } from 'blessed-components/collapsible/blessed';

const screen = blessed.screen({ smartCSR: true });
const panel = collapsible({
  parent: screen,
  box: {
    top: 1,
    left: 2,
    width: 40,
    height: 8,
  },
  data: {
    defaultExpanded: true,
    title: 'Details',
    content: 'Status: online\nRegion: Lima',
  },
});

screen.render();

panel.toggle();
screen.render();

panel.destroy();
screen.destroy();
```

Append custom widgets to `panel.body` when the body should preserve child state
across collapse and expand operations. The adapter never calls
`screen.render()`.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | Required | Non-empty, single-line header title. |
| `expanded` | `boolean` | `false` | Body visibility state. |
| `focused` | `boolean` | `false` | Adds a non-color focus prefix. |
| `disabled` | `boolean` | `false` | Adds a disabled suffix and blocks adapter toggling. |
| `characters` | `CollapsibleCharacters` | `▸` / `▾` | Marker pair. |
| `width` | `number` | `undefined` | Optional terminal-cell truncation width. |

## Adapter State

Use `expanded` with `onExpandedChange` for controlled state, or
`defaultExpanded` for uncontrolled state. The handle exposes `toggle()`,
`setExpanded()`, `expanded()`, `focus()`, and the mounted `header` and `body`
elements.
