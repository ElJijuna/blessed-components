# Button

Focusable terminal action with keyboard, mouse, disabled, and semantic theme
states.

## Features

- Pure renderer with no Blessed import.
- Visible focus marker independent of color.
- Explicit disabled text independent of color.
- Enter, Space, mouse click, and imperative activation.
- Disabled buttons are removed from Blessed keyboard and mouse navigation.
- Bracketed and plain variants.
- ANSI sequences and Blessed tags removed from labels.
- Shared Box theme contract for idle, focused, and disabled states.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderButton } from 'blessed-components/button';

renderButton({ label: 'Deploy' });
// [ Deploy ]

renderButton({
  focused: true,
  label: 'Deploy',
});
// › [ Deploy ]

renderButton({
  disabled: true,
  label: 'Delete',
});
// [ Delete ] (disabled)
```

The renderer accepts `variant: 'plain'` when surrounding layout already
provides a clear action boundary.

## Blessed adapter

```ts
import blessed from 'blessed';
import { button } from 'blessed-components/button/blessed';

const screen = blessed.screen({ smartCSR: true });
const deploy = button({
  parent: screen,
  box: {
    top: 1,
    left: 2,
    width: 14,
    height: 1,
  },
  data: {
    label: 'Deploy',
    onPress() {
      // Start deployment.
    },
  },
});

deploy.focus();
screen.render();
```

Enter, Space, and mouse click call `onPress`. The adapter never calls
`screen.render()`, so applications can batch updates.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | Required | Non-empty, single-line action name. |
| `variant` | `'bracketed' \| 'plain'` | `'bracketed'` | Visual structure. |
| `focused` | `boolean` | `false` | Adds the visible `›` focus cue. |
| `disabled` | `boolean` | `false` | Adds explicit disabled text. |

## Adapter API

`button(options)` returns a `ButtonHandle` with:

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

Disabled buttons cannot receive focus through the adapter and are removed
from Blessed keyable and clickable collections.

## Theming

| State | Foreground | Background |
| --- | --- | --- |
| Idle | `tone` / `foreground` | `backgroundTone` / `background` |
| Focused | `focusedTone` / `foreground` | `focusedBackgroundTone` / `primary` |
| Disabled | `disabledTone` / `muted` | `disabledBackgroundTone` / `background` |

Explicit Blessed styles win over semantic colors. Text cues remain available
in no-color terminals.

## Tree shaking

```ts
import { renderButton } from 'blessed-components/button';
import { button } from 'blessed-components/button/blessed';
```
