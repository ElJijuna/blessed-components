# DescriptionList

Display term and description groups for metadata, definitions, and compact
detail panels.

## Features

- Pure renderer with no Blessed import.
- Cell-aware term alignment for Unicode and emoji text.
- Column and stacked layouts with automatic narrow-width fallback.
- Optional wrapping when an available width is supplied.
- Configurable term width, column gap, and row gap.
- ANSI sequences and Blessed tags removed from output.
- Blessed adapter using the shared Box theme contract.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderDescriptionList } from 'blessed-components/description-list';

renderDescriptionList({
  items: [
    { term: 'Status', description: 'Online' },
    { term: 'Region', description: 'Lima' },
  ],
});

// Status  Online
// Region  Lima
```

### Responsive width

```ts
renderDescriptionList({
  items: [{ term: 'Summary', description: 'Ready to deploy after checks pass.' }],
  width: 16,
});

// Summary
//   Ready to deploy
//   after checks
//   pass.
```

Use `layout: 'columns'` to force aligned columns, or `layout: 'stacked'` to
place descriptions below each term.

## Blessed adapter

```ts
import blessed from 'blessed';
import { descriptionList } from 'blessed-components/description-list/blessed';

const screen = blessed.screen({ smartCSR: true });
const details = descriptionList({
  parent: screen,
  box: {
    top: 1,
    left: 2,
    width: 40,
    height: 4,
  },
  data: {
    items: [
      { term: 'Status', description: 'Online' },
      { term: 'Region', description: 'Lima' },
    ],
    tone: 'success',
  },
});

screen.render();

details.setData({
  items: [{ term: 'Status', description: 'Offline' }],
  tone: 'danger',
});
screen.render();

details.destroy();
screen.destroy();
```

The adapter never calls `screen.render()`.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `readonly DescriptionListItem[]` | Required | Ordered term/description entries. |
| `layout` | `'auto' \| 'columns' \| 'stacked'` | `'auto'` | Entry arrangement. |
| `width` | `number` | `undefined` | Available content width for wrapping and automatic layout. |
| `termWidth` | `'auto' \| number` | `'auto'` | Automatic or fixed term column width. |
| `gap` | `number` | `2` | Spaces between terms and descriptions, or stacked indentation. |
| `rowGap` | `number` | `0` | Blank lines inserted between entries. |

Terms must be non-empty and single-line. Numeric descriptions must be finite.

## Theming

The Blessed adapter uses the shared Box theme contract:

- `tone` controls foreground color.
- `backgroundTone` controls background color.
- `borderTone` controls border color.
- Explicit Blessed styles win over semantic theme values.

DescriptionList remains understandable without color because layout carries the
relationship between each term and description.
