# IconButton

Compact focusable terminal action with a required text description.

## Features

- Pure renderer with no Blessed import.
- Required `label` even when only the icon is visible.
- Visible focus marker independent of color.
- Explicit disabled text independent of color.
- Enter, Space, mouse click, and imperative activation.
- Disabled icon buttons are removed from Blessed keyboard and mouse navigation.
- Bracketed and plain variants.
- Optional visible label for less compact layouts.
- ANSI sequences and Blessed tags removed from icon and label.
- Shared Box theme contract for idle, focused, and disabled states.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderIconButton } from 'blessed-components/icon-button';

renderIconButton({ icon: '+', label: 'Create' });
// [ + ]

renderIconButton({
  focused: true,
  icon: '↻',
  label: 'Refresh',
});
// › [ ↻ ]

renderIconButton({
  icon: '×',
  label: 'Close',
  showLabel: true,
});
// [ × Close ]
```

## Blessed adapter

```ts
import blessed from 'blessed';
import { iconButton } from 'blessed-components/icon-button/blessed';

const screen = blessed.screen({ smartCSR: true });
const refresh = iconButton({
  parent: screen,
  box: {
    top: 1,
    left: 2,
    width: 7,
    height: 1,
  },
  data: {
    icon: '↻',
    label: 'Refresh data',
    onPress() {
      // Refresh data.
    },
  },
});

refresh.focus();
screen.render();
```

Enter, Space, and mouse click call `onPress`. The adapter never calls
`screen.render()`, so applications can batch updates.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `string` | Required | Non-empty, single-line visible icon or glyph. |
| `label` | `string` | Required | Non-empty, single-line action description. |
| `showLabel` | `boolean` | `false` | Renders text label beside the icon. |
| `variant` | `'bracketed' \| 'plain'` | `'bracketed'` | Visual structure. |
| `focused` | `boolean` | `false` | Adds the visible `›` focus cue. |
| `disabled` | `boolean` | `false` | Adds explicit disabled text. |

## Adapter API

`iconButton(options)` returns an `IconButtonHandle` with:

- `element`
- `focus()`
- `press()`
- `setData()`
- `destroy()`

`press()` returns `true` after enabled activation and `false` while disabled.

## Keyboard and focus

| Input | Action |
| --- | --- |
| `Enter` | Activate |
| `Space` | Activate |
| Mouse click | Activate |

Disabled icon buttons cannot receive focus through the adapter and are removed
from Blessed keyable and clickable collections.

## Tree shaking

```ts
import { renderIconButton } from 'blessed-components/icon-button';
import { iconButton } from 'blessed-components/icon-button/blessed';
```
