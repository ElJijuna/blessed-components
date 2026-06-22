# Card

Composable terminal frame with independent header, title, description, body,
and footer regions.

## Features

- Compound API: each Card part owns one Blessed `BoxElement`.
- Safe, terminal-cell-aware region text through a pure renderer.
- Predictable default layout for standard header/body/footer composition.
- Semantic foreground, background, and border theme tokens.
- Explicit Blessed styles override semantic theme colors.
- Colorless output preserves all content.
- Shared `setData()` and `destroy()` lifecycle.

## Installation

```sh
npm install blessed blessed-components
```

`blessed` is a peer dependency.

## Composition

```ts
import blessed from 'blessed';
import {
  cardBody,
  cardDescription,
  cardFooter,
  cardHeader,
  cardRoot,
  cardTitle,
} from 'blessed-components/card/blessed';

const screen = blessed.screen({ smartCSR: true });
const root = cardRoot({
  parent: screen,
  box: {
    top: 1,
    left: 2,
    width: 48,
    height: 10,
  },
});
const header = cardHeader({ parent: root.element });

cardTitle({
  parent: header.element,
  data: { content: 'Production deploy' },
});
cardDescription({
  parent: header.element,
  data: { content: 'api-service · us-east-1' },
});
cardBody({
  parent: root.element,
  data: { content: 'All health checks passing.' },
});
cardFooter({
  parent: root.element,
  data: { content: 'Updated now' },
});

screen.render();
```

Pass each returned `element` as the `parent` of nested parts or other
components. Card never owns or renders the screen.

## Default layout

The defaults assume title and description live inside Header, while Body and
Footer live inside Root:

| Part | Default position |
| --- | --- |
| Root | Fills parent, line border, one-cell horizontal padding |
| Header | `top: 0`, `height: 2`, full width |
| Title | `top: 0`, `height: 1`, bold |
| Description | `top: 1`, `height: 1`, muted |
| Body | Between two-row header and one-row footer |
| Footer | `bottom: 0`, `height: 1`, muted |

Every default can be replaced through `box`.

## Pure region renderer

```ts
import { renderCardRegion } from 'blessed-components/card';

renderCardRegion({
  content: 'Deployment running',
  overflow: 'truncate',
  width: 12,
});
// "Deployment…"
```

`renderCardRegion` removes ANSI sequences and Blessed tags. It supports Text's
cell-aware wrapping, clipping, truncation, and alignment options.

## Updates

Each part preserves element identity:

```ts
const footer = cardFooter({
  parent: root.element,
  data: { content: 'Queued', tone: 'warning' },
});

footer.setData({
  content: 'Complete',
  tone: 'success',
});
screen.render();
```

`setData()` replaces complete region data. Call `screen.render()` after one or
more updates.

## Theming

Root uses `foreground`, `background`, and `border` semantic tokens. Regions use
these defaults:

- Title, Header, Body: `foreground`
- Description, Footer: `muted`

Pass `tone`, `theme`, or explicit `box.style` values to customize a part.
Explicit Blessed styles win. Semantic colors become undefined in no-color
mode.

## Accessibility

- Card is display-only: no focus or keyboard behavior.
- Title and description provide visible hierarchy without hidden semantics.
- Meaning must not depend only on color.
- ANSI control sequences and Blessed tags are removed from region content.
- Consumers control reading order through element composition.

## Lifecycle

Every part returns a handle containing:

- `element` — owned Blessed box;
- `setData(data)` — update content and semantic style;
- `destroy()` — detach that part.

Destroying Root also destroys its nested Blessed children.

## Tree shaking

Pure renderer:

```ts
import { renderCardRegion } from 'blessed-components/card';
```

Blessed compound adapters:

```ts
import { cardRoot, cardBody } from 'blessed-components/card/blessed';
```
