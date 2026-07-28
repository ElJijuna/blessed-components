# Box

Typed, composable Blessed container with semantic theme tokens.

## Features

- One Blessed `BoxElement`, suitable as parent for any component.
- Semantic foreground, background, and border tokens.
- Density and active-variant spacing mapped to Blessed padding.
- Theme border structure mapped to Blessed `line` or `bg` borders.
- `theme.components.box` color overrides.
- Explicit Blessed styles, padding, and borders override theme values.
- Automatic no-color behavior.
- Pure theme resolver without Blessed imports.
- Shared `setData()` and `destroy()` lifecycle.

## Installation

```sh
npm install blessed blessed-components
```

## Blessed adapter

```ts
import blessed from 'blessed';
import { box } from 'blessed-components/box/blessed';
import { text } from 'blessed-components/text/blessed';

const screen = blessed.screen({ smartCSR: true });
const panel = box({
  parent: screen,
  box: {
    top: 1,
    left: 2,
    width: 40,
    height: 8,
    border: 'line',
    padding: { left: 1, right: 1 },
  },
  data: {
    borderTone: 'primary',
  },
});

text({
  parent: panel.element,
  data: {
    content: 'Service healthy',
    tone: 'success',
  },
});

screen.render();
```

Box owns no text content. Pass `panel.element` as parent to nested components.

## Semantic colors

```ts
import { createTheme } from 'blessed-components/core/theme';

const theme = createTheme({
  activeVariant: 'panel',
  borders: { style: 'line' },
  components: {
    box: { foreground: 'bright-white' },
  },
  density: 'spacious',
  variants: {
    panel: {
      colors: { background: 'blue' },
      spacing: { paddingX: 2 },
    },
  },
});

const panel = box({
  parent: screen,
  data: { theme },
});
```

Semantic color defaults:

| Option | Default |
| --- | --- |
| `foregroundTone` | `foreground` |
| `backgroundTone` | `background` |
| `borderTone` | `border` |

Use `createTheme()` to replace semantic colors. Explicit
`box.style.fg`, `box.style.bg`, and `box.style.border.fg` take precedence.
Explicit `box.padding` and `box.border` likewise take precedence over
structural theme tokens.

## Pure resolver

```ts
import { resolveBoxTheme } from 'blessed-components/box';

resolveBoxTheme({
  capabilities: { colorLevel: 1 },
  foregroundTone: 'primary',
});
```

The resolver returns `foreground`, `background`, and `border`. All become
`undefined` when `colorLevel` is `0`.

## Updates and lifecycle

```ts
panel.setData({
  borderTone: 'danger',
});
screen.render();

panel.destroy();
```

`setData()` replaces semantic style data while preserving element identity.
Box never calls `screen.render()`.

## Adapter foundation

`createBoxStyleController()` applies this same contract to an existing Blessed
`BoxElement`. Built-in `Text`, `Card`, `Sparkline`, and `Stat` adapters use it,
so they share:

- `capabilities`;
- `theme`;
- component-level color fallback;
- active theme variants;
- semantic foreground, background, and border tones;
- explicit Blessed style precedence;
- no-color behavior.

Component adapters may expose `tone` as the ergonomic alias for
`foregroundTone`.

## Accessibility

- Box is display-only unless consumers explicitly enable Blessed interaction.
- Meaning must not depend only on color.
- No-color mode preserves structure and nested content.
- Reading and focus order follow child composition.

## Tree shaking

```ts
import { resolveBoxTheme } from 'blessed-components/box';
import { box } from 'blessed-components/box/blessed';
```
