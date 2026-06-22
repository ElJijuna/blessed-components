# KeyValue

Display aligned labels and values for metadata, configuration, and compact
detail panels.

## Features

- Pure renderer with no Blessed import.
- Cell-aware alignment for Unicode and emoji labels.
- Automatic or fixed key width.
- Row and compact inline layouts.
- Configurable separator, spacing, and inline delimiter.
- Multiline values aligned under their first line.
- ANSI sequences and Blessed tags removed from output.
- Blessed adapter using the shared Box theme contract.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderKeyValue } from 'blessed-components/key-value';

renderKeyValue({
  items: [
    { key: 'Status', value: 'Online' },
    { key: 'CPU', value: '42%' },
    { key: 'Region', value: 'Lima' },
  ],
});

// Status : Online
// CPU    : 42%
// Region : Lima
```

### Custom columns

```ts
renderKeyValue({
  gap: 2,
  items: [
    { key: 'Host', value: 'api-01' },
    { key: 'Port', value: 443 },
  ],
  keyWidth: 8,
  separator: '│',
});
```

Keys wider than a numeric `keyWidth` are truncated by terminal-cell width.
Use `keyWidth: 'auto'` to align against the widest key.

### Inline layout

```ts
renderKeyValue({
  itemSeparator: ' | ',
  items: [
    { key: 'CPU', value: '42%' },
    { key: 'RAM', value: '8 GB' },
  ],
  layout: 'inline',
});

// CPU : 42% | RAM : 8 GB
```

## Blessed adapter

```ts
import blessed from 'blessed';
import { keyValue } from 'blessed-components/key-value/blessed';

const screen = blessed.screen({ smartCSR: true });
const details = keyValue({
  parent: screen,
  box: {
    top: 1,
    left: 2,
    width: 32,
    height: 3,
  },
  data: {
    items: [
      { key: 'Status', value: 'Online' },
      { key: 'Region', value: 'Lima' },
    ],
    tone: 'success',
  },
});

screen.render();

details.setData({
  items: [{ key: 'Status', value: 'Offline' }],
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
| `items` | `readonly KeyValueItem[]` | Required | Ordered key/value entries. |
| `keyWidth` | `'auto' \| number` | `'auto'` | Automatic or fixed key column width. |
| `separator` | `string` | `':'` | Text between each key and value. |
| `gap` | `number` | `1` | Spaces around a non-empty separator. |
| `layout` | `'rows' \| 'inline'` | `'rows'` | Entry arrangement. |
| `itemSeparator` | `string` | `' · '` | Delimiter used by inline layout. |

Keys must be non-empty and single-line. Numeric values must be finite.

## Theming

The Blessed adapter uses the shared Box theme contract:

- `tone` controls foreground color.
- `backgroundTone` controls background color.
- `borderTone` controls border color.
- Explicit Blessed styles win over semantic theme values.

KeyValue remains understandable without color because labels and separators
carry the relationship between each key and value.

## Tree shaking

```ts
import { renderKeyValue } from 'blessed-components/key-value';
import { keyValue } from 'blessed-components/key-value/blessed';
```
