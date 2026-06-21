# Text

Safe, terminal-cell-aware typography for `blessed-components`.

Text provides a pure renderer for sanitization, wrapping, clipping, truncation,
and alignment, plus a thin Blessed adapter for semantic theme colors and
responsive element dimensions.

## Installation

```sh
npm install blessed blessed-components
```

`blessed` is a peer dependency.

## Pure renderer

```ts
import { renderText } from 'blessed-components/text';

const content = renderText({
  content: 'Deploying 红色 service',
  overflow: 'wrap',
  width: 12,
});
```

The pure renderer:

- removes ANSI control sequences and Blessed formatting tags;
- measures grapheme clusters and wide Unicode by terminal cells;
- supports `wrap`, `clip`, and `truncate` overflow;
- supports start, middle, and end truncation;
- supports horizontal and vertical alignment;
- never imports Blessed.

## Overflow

### Wrap

```ts
renderText({
  content: 'A long terminal message',
  overflow: 'wrap',
  width: 10,
});
```

Wrapping is deterministic and cell-aware. It preserves explicit newline
boundaries but does not perform language-aware word breaking.

### Truncate

```ts
renderText({
  content: '/workspace/packages/blessed-components',
  overflow: 'truncate',
  truncatePosition: 'middle',
  width: 20,
});
```

Use a custom omission marker when ASCII output is required:

```ts
renderText({
  content: 'deployment-running',
  omission: '...',
  overflow: 'truncate',
  width: 12,
});
```

### Clip

```ts
renderText({
  content: 'abcdefgh',
  overflow: 'clip',
  width: 4,
});
// "abcd"
```

## Alignment

```ts
renderText({
  align: 'center',
  content: 'Ready',
  height: 3,
  overflow: 'clip',
  verticalAlign: 'middle',
  width: 20,
});
```

Horizontal alignment uses leading spaces only, avoiding trailing terminal
whitespace. Vertical alignment inserts empty lines.

## Blessed adapter

```ts
import blessed from 'blessed';
import { text } from 'blessed-components/text/blessed';

const screen = blessed.screen({ smartCSR: true });
const message = text({
  parent: screen,
  box: {
    border: 'line',
    height: 5,
    width: 40,
  },
  data: {
    content: 'Waiting for deployment...',
    tone: 'muted',
  },
});

screen.render();

message.setData({
  content: 'Deployment failed',
  tone: 'danger',
});
screen.render();
```

When renderer dimensions are omitted, the adapter uses the Blessed element's
inner width and height. Border and padding cells are excluded.

## Theming and no-color mode

`tone` selects a semantic foreground token:

- `foreground`
- `muted`
- `primary`
- `info`
- `success`
- `warning`
- `danger`

```ts
import { createTheme } from 'blessed-components/core/theme';

const theme = createTheme({
  colors: {
    muted: 'gray',
    primary: 'cyan',
  },
});

text({
  parent: screen,
  data: {
    content: 'Connected',
    theme,
    tone: 'success',
  },
});
```

The adapter detects terminal color support. Semantic colors are disabled when
color output is unavailable or `NO_COLOR` is active. Pass explicit
`capabilities` for deterministic tests.

An explicit `box.style.fg` takes precedence over the semantic tone.

## Security and accessibility

Text treats content as untrusted terminal text:

- ANSI sequences are removed to prevent terminal control injection;
- Blessed tags are removed instead of interpreted;
- adapters always set `tags: false`;
- semantic meaning must not depend only on color;
- no-color output preserves the complete text.

## Tree-shaking

Import the pure renderer without Blessed:

```ts
import { renderText } from 'blessed-components/text';
```

Import the adapter only when creating Blessed elements:

```ts
import { text } from 'blessed-components/text/blessed';
```
