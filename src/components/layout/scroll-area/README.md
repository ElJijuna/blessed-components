# ScrollArea

Focusable vertical scrolling container with composable content and a visible
terminal scrollbar.

## Features

- Headless line, page, home, end, and scrollbar metrics.
- Blessed wrapper with clipped `contentElement`.
- Arrow Up/Down, Page Up/Down, Home, End, and mouse wheel.
- Controlled and uncontrolled offsets.
- Stable reserved scrollbar column to avoid layout shifts.
- Visible focus cue through a heavier track character.
- Unicode and custom ASCII scrollbar characters.
- Shared Box theme contract.

## Installation

```sh
npm install blessed blessed-components
```

## Pure scrollbar renderer

```ts
import { renderScrollAreaScrollbar } from 'blessed-components/scroll-area';

renderScrollAreaScrollbar({
  contentSize: 20,
  offset: 5,
  thumbOffset: 1,
  thumbSize: 2,
  viewportSize: 5,
});

// │
// █
// █
// │
// │
```

The renderer returns an empty string when all content fits.

## Blessed adapter

```ts
import blessed from 'blessed';
import { scrollArea } from 'blessed-components/scroll-area/blessed';
import { text } from 'blessed-components/text/blessed';

const screen = blessed.screen({ smartCSR: true });
const logs = scrollArea({
  parent: screen,
  box: {
    top: 1,
    left: 2,
    width: 50,
    height: 12,
    border: 'line',
  },
  data: {
    contentHeight: 100,
    borderTone: 'primary',
  },
});

text({
  parent: logs.contentElement,
  box: {
    top: 40,
    left: 0,
    right: 0,
    height: 1,
  },
  data: {
    content: 'Log row 41',
  },
});

logs.scrollTo(40);
logs.focus();
screen.render();
```

Attach children to `contentElement`, not the clipping root.

## State

Uncontrolled:

```ts
scrollArea({
  data: {
    contentHeight: 100,
    defaultOffset: 20,
  },
});
```

Controlled:

```ts
scrollArea({
  data: {
    contentHeight: 100,
    offset,
    onOffsetChange(nextOffset) {
      offset = nextOffset;
    },
  },
});
```

Controlled input emits `onOffsetChange`; visual position changes after the
new `offset` reaches `setData()`.

## Keyboard and mouse

| Input | Action |
| --- | --- |
| `Arrow Up` | Scroll one row backward |
| `Arrow Down` | Scroll one row forward |
| `Page Up` | Scroll one page backward |
| `Page Down` | Scroll one page forward |
| `Home` | Move to first row |
| `End` | Move to last visible page |
| Mouse wheel | Scroll one row |

Focused scrollbar track defaults to `┃`; idle track defaults to `│`.

## Data API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `contentHeight` | `number` | Required | Total content rows. |
| `defaultOffset` | `number` | `0` | Initial uncontrolled offset. |
| `offset` | `number` | — | Controlled offset. |
| `onOffsetChange` | `(offset) => void` | — | Offset request listener. |
| `pageOverlap` | `number` | `1` | Rows retained during paging. |
| `showScrollbar` | `boolean` | `true` | Reserve and display scrollbar column. |
| `characters` | `ScrollAreaCharacters` | `│`, `█` | Idle track and thumb. |
| `focusedCharacters` | `ScrollAreaCharacters` | `┃`, `█` | Focused track and thumb. |
| `scrollbarTone` | `keyof ThemeColors` | `muted` | Scrollbar semantic foreground. |

## Handle API

`scrollArea(options)` returns:

- `element`
- `contentElement`
- `scrollbarElement`
- `focus()`
- `offset()`
- `metrics()`
- `lineForward()` / `lineBackward()`
- `pageForward()` / `pageBackward()`
- `home()` / `end()`
- `scrollTo()`
- `resize()`
- `setData()`
- `destroy()`

The adapter never calls `screen.render()`.

## Tree shaking

```ts
import { renderScrollAreaScrollbar } from 'blessed-components/scroll-area';
import { scrollArea } from 'blessed-components/scroll-area/blessed';
```
