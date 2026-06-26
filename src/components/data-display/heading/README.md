# Heading

`Heading` renders safe terminal headings with deterministic hierarchy markers.
Use the pure renderer for snapshots or non-Blessed targets, and the Blessed
adapter for themed terminal UIs.

```ts
import { renderHeading } from 'blessed-components/heading';

renderHeading({
  content: 'Deployments',
  level: 2,
  width: 18,
});
// "## Deployments"
```

```ts
import blessed from 'blessed';
import { heading } from 'blessed-components/heading/blessed';

const screen = blessed.screen({ smartCSR: true });
const title = heading({
  parent: screen,
  box: { top: 0, left: 0, width: 32, height: 1 },
  data: {
    content: 'Deployments',
    level: 1,
    tone: 'primary',
  },
});

screen.render();
title.destroy();
screen.destroy();
```

The renderer strips ANSI sequences and Blessed tags from content before layout.
It supports `level` values from `1` through `6`, optional Markdown-style
markers, optional underlines, alignment, truncation, clipping, and wrapping via
the same text policies as `Text`.
