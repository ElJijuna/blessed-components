# Overlay

Visual terminal layer with controlled/uncontrolled open state, shared overlay
ordering, Escape dismissal, z-order, and focus restoration.

## Features

- Controlled `open` and uncontrolled `defaultOpen`.
- Shared overlay stack per Blessed screen.
- Optional modal blocking for lower overlay layers.
- Escape dismissal for the topmost Overlay only.
- Previous focus restoration.
- Shared Box theming.
- Composable content through `handle.element`.
- Listener cleanup on destroy.

## Installation

```sh
npm install blessed blessed-components
```

## Usage

```ts
import blessed from 'blessed';
import { overlay, text } from 'blessed-components';

const screen = blessed.screen({ smartCSR: true });
const layer = overlay({
  parent: screen,
  data: {
    id: 'settings-layer',
    defaultOpen: true,
    modal: true,
  },
  box: {
    style: { bg: 'black' },
  },
});

text({
  parent: layer.element,
  box: {
    border: 'line',
    height: 7,
    left: 'center',
    padding: { left: 1, right: 1 },
    top: 'center',
    width: 40,
  },
  data: {
    content: 'Settings panel\n\nPress Escape to close',
    overflow: 'wrap',
  },
});

screen.render();
```

## State

Uncontrolled usage uses `defaultOpen`. Controlled usage supplies `open` and
updates it after `onOpenChange`:

```ts
const layer = overlay({
  parent: screen,
  data: {
    id: 'help-layer',
    open,
    onOpenChange(nextOpen) {
      open = nextOpen;
      layer.setData({ id: 'help-layer', open });
    },
  },
});
```

In controlled mode, `open()`, `close()`, and `toggle()` emit requests. Visible
state changes only after `setData()` receives the new `open` value.

## Stacking

Overlays share the same screen-level stack as `Dialog`. `modal` defaults to
`false`; set it to `true` when a layer should block interaction below it.

`blocked()` reports whether a modal layer above the current overlay blocks it.

## Keyboard map

| Key | Behavior |
| --- | --- |
| Escape | Request close when enabled and topmost |

Set `dismissOnEscape` to `false` when explicit action is required.

## Pure APIs

```ts
import { createOverlayState } from 'blessed-components/overlay';
```

`createOverlayState()` provides deterministic controlled/uncontrolled behavior
without importing Blessed.

## Lifecycle

The handle exposes `isOpen`, `blocked()`, `open()`, `close()`, `toggle()`,
`focus()`, `setData()`, and `destroy()`.

`destroy()` removes the global key listener, closes the overlay entry, destroys
children, and restores focus when needed.
