# Stack

Arrange direct Blessed children vertically or horizontally with consistent
terminal-cell gaps.

## Features

- Vertical and horizontal flow.
- Cross-axis `start`, `center`, `end`, and `stretch` alignment.
- Integer terminal-cell gaps.
- Pure deterministic layout calculator.
- Themed Box-based Blessed container.
- Explicit `layout()` after child composition changes.
- Relayout on Stack resize and `setData()`.

## Installation

```sh
npm install blessed blessed-components
```

## Blessed adapter

```ts
import blessed from 'blessed';
import { stack } from 'blessed-components/stack/blessed';
import { text } from 'blessed-components/text/blessed';

const screen = blessed.screen({ smartCSR: true });
const content = stack({
  parent: screen,
  box: {
    top: 1,
    left: 2,
    width: 40,
    height: 12,
  },
  data: {
    direction: 'vertical',
    gap: 1,
  },
});

text({
  parent: content.element,
  box: { height: 1, width: 20 },
  data: { content: 'First row' },
});
text({
  parent: content.element,
  box: { height: 2, width: 20 },
  data: { content: 'Second row' },
});

content.layout();
screen.render();
```

Call `layout()` after adding, removing, or reordering direct children. Stack
does not monkey-patch Blessed child lifecycle.

## Direction

Vertical Stack preserves child heights. Horizontal Stack preserves child
widths:

```ts
content.setData({
  direction: 'horizontal',
  gap: 2,
});
screen.render();
```

Intrinsic child sizes are captured on their first layout. This lets Stack
switch direction without losing sizes after `stretch` modifies one axis.

## Alignment

`align` controls cross-axis placement:

| Value | Behavior |
| --- | --- |
| `stretch` | Fill available cross-axis space. |
| `start` | Preserve size and align at start. |
| `center` | Preserve size and center. |
| `end` | Preserve size and align at end. |

Default is `stretch`.

## Pure layout

```ts
import { calculateStackLayout } from 'blessed-components/stack';

calculateStackLayout({
  width: 20,
  height: 10,
  gap: 1,
  items: [
    { width: 8, height: 2 },
    { width: 12, height: 3 },
  ],
});
```

Returns `{ x, y, width, height }` for every item in input order. Sizes and gap
must be non-negative integers. Layout may exceed available main-axis space;
the Stack container controls clipping.

## Theming

Stack uses Box's shared semantic contract:

- `foregroundTone`
- `backgroundTone`
- `borderTone`
- `theme`
- `capabilities`

Explicit Blessed styles win. No-color mode removes semantic colors.

## Accessibility

- Stack changes visual layout only.
- Reading and focus order remain child insertion order.
- Direction changes must not be the only way meaning is communicated.
- Stack adds no keyboard interaction.

## Lifecycle

Stack returns:

- `element`
- `layout()`
- `setData(data)`
- `destroy()`

It never calls `screen.render()`.

## Tree shaking

```ts
import { calculateStackLayout } from 'blessed-components/stack';
import { stack } from 'blessed-components/stack/blessed';
```
