# List

Typed single-selection list for terminal interfaces. List combines a pure,
terminal-cell-aware renderer with an interactive Blessed adapter built from the
shared collection, focus-scope, selection, and scroll-area primitives.

## Installation

```sh
npm install blessed blessed-components
```

`blessed` is a peer dependency.

## Pure renderer

Use the pure renderer for deterministic output, tests, or custom terminal
adapters:

```ts
import { renderList } from 'blessed-components/list';

const content = renderList({
  activeId: 'build',
  height: 3,
  items: [
    { id: 'test', label: 'Run tests' },
    { id: 'build', label: 'Build package' },
    { disabled: true, id: 'deploy', label: 'Deploy release' },
  ],
  selectedId: 'test',
  width: 24,
});
```

The renderer:

- displays active, selected, and disabled states without requiring color;
- truncates by terminal cells rather than JavaScript string length;
- renders a bounded viewport using `offset` and `height`;
- never mutates caller-owned items;
- never imports Blessed.

## Blessed adapter

```ts
import blessed from 'blessed';
import { list } from 'blessed-components/list/blessed';

const screen = blessed.screen({ smartCSR: true });
const commands = list({
  parent: screen,
  box: {
    border: 'line',
    height: 8,
    keys: true,
    width: 36,
  },
  data: {
    defaultValue: 'test',
    items: [
      { id: 'test', label: 'Run tests' },
      { id: 'build', label: 'Build package' },
      { disabled: true, id: 'deploy', label: 'Deploy release' },
    ],
    onValueChange(value) {
      console.log(`Selected: ${value}`);
    },
  },
});

commands.focus();
screen.render();
```

The adapter never calls `screen.render()`. Applications can batch multiple
updates before rendering.

## Controlled state

Pass `value` to make selection controlled:

```ts
let selectedId = 'test';

function updateValue(nextValue: string): void {
  selectedId = nextValue;
  commands.setData({
    items,
    value: selectedId,
    onValueChange: updateValue,
  });
  screen.render();
}

const commands = list({
  parent: screen,
  data: {
    items,
    value: selectedId,
    onValueChange: updateValue,
  },
});
```

In controlled mode, selection requests call `onValueChange`, but the visible
selection changes only after `setData` receives the new `value`.

## Uncontrolled state

Use `defaultValue` when the List should retain its own selected identifier:

```ts
const commands = list({
  parent: screen,
  data: {
    defaultValue: 'test',
    items,
  },
});

commands.selectActive();
console.log(commands.value());
```

## Keyboard map

| Key                 | Behavior                                     |
| ------------------- | -------------------------------------------- |
| `ArrowDown`         | Move to the next enabled item.               |
| `ArrowUp`           | Move to the previous enabled item.           |
| `Home`              | Move to the first enabled item.               |
| `End`               | Move to the last enabled item.                |
| `PageDown`          | Move forward by one viewport page.            |
| `PageUp`            | Move backward by one viewport page.           |
| `Enter` or `Space`  | Select the active item.                       |

Navigation skips disabled items. Arrow navigation wraps at collection
boundaries, while page navigation remains bounded.

## Mouse

The Blessed adapter enables mouse input by default:

| Input        | Behavior                                     |
| ------------ | -------------------------------------------- |
| Row click    | Focus and select the clicked enabled row.    |
| Disabled row | No-op.                                       |
| Wheel down   | Move to the next enabled item.               |
| Wheel up     | Move to the previous enabled item.           |

Pass `box: { mouse: false }` to opt out of Blessed mouse registration.

## Imperative handle

The returned `ListHandle` extends `BlessedComponentHandle` and adds:

- `activeId()` — current cursor identifier;
- `value()` — current controlled or uncontrolled selection;
- `focus()` and `focusItem(id)` — terminal and item focus;
- `next()`, `previous()`, `first()`, and `last()` — cursor movement;
- `pageForward()` and `pageBackward()` — viewport movement;
- `selectActive()` — selection request;
- `setData(data)` — replace items and state configuration;
- `destroy()` — detach the owned Blessed element.

## Accessibility

Terminal applications do not expose browser ARIA semantics, so List preserves
meaning through text and keyboard behavior:

- state markers remain understandable without color;
- disabled items remain visible but cannot receive cursor or selection;
- every operation is keyboard accessible;
- controlled mode keeps application state as the source of truth;
- stable item identifiers preserve focus and selection across updates.

Applications should provide descriptive labels and announce consequential
selection results in an appropriate status region.

## Tree-shaking

Import the pure renderer without loading Blessed:

```ts
import { renderList } from 'blessed-components/list';
```

Import the Blessed adapter only when needed:

```ts
import { list } from 'blessed-components/list/blessed';
```
