# Sparkline

Render compact numeric trends with Unicode or custom terminal glyphs.

## Features

- Pure renderer with no Blessed import.
- Blessed adapter with `setData()` and `destroy()`.
- Automatic or explicit numeric domains.
- Peak-preserving downsampling for narrow terminals.
- Stable rendering for constant series.
- Empty-state text.
- Optional label, primary value, and summary.
- Custom glyph scales for Unicode or ASCII terminals.
- Dedicated tree-shakable subpath exports.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderSparkline } from 'blessed-components/sparkline';

renderSparkline({
  values: [1, 2, 3, 4, 5, 6, 7, 8],
  width: 8,
});

// ▁▂▃▄▅▆▇█
```

### Metadata

```ts
renderSparkline({
  label: 'Weekly downloads',
  value: '25.2M',
  values: [1, 3, 2, 5, 8, 6],
  width: 6,
  summary: 'peak: 8M',
});

// Weekly downloads 25.2M
// ▁▃▂▅█▆ peak: 8M
```

### Explicit domain

```ts
renderSparkline({
  min: 0,
  max: 100,
  values: [0, 50, 100],
  width: 3,
});

// ▁▄█
```

### ASCII mode

```ts
renderSparkline({
  characters: ['.', ':', '*', '#'],
  values: [0, 30, 60, 100],
  width: 4,
});
```

## Downsampling

`width` is the maximum number of samples rendered. When the source series is
wider, values are divided into ordered buckets and the maximum value from each
bucket is retained. This preserves short peaks that uniform point sampling can
hide.

Series shorter than `width` are not padded or interpolated.

## Empty and constant series

Empty arrays render `No data` by default:

```ts
renderSparkline({ values: [], width: 10 });
```

Override with `emptyText`. Constant series use the middle glyph instead of
dividing by zero:

```ts
renderSparkline({ values: [4, 4, 4], width: 3 });
// ▄▄▄
```

## Blessed adapter

```ts
import blessed from 'blessed';
import { sparkline } from 'blessed-components/sparkline/blessed';

const screen = blessed.screen({ smartCSR: true });
const downloads = sparkline({
  parent: screen,
  box: {
    top: 0,
    left: 0,
    width: 40,
    height: 2,
  },
  data: {
    label: 'Downloads',
    tone: 'primary',
    values: [1, 3, 2, 5, 8, 6],
    width: 20,
  },
});

screen.render();

downloads.setData({
  label: 'Downloads',
  values: [2, 4, 6, 8],
  width: 20,
});
screen.render();

downloads.destroy();
```

The adapter never calls `screen.render()`. This lets applications batch
multiple component updates.

### Semantic colors

Sparkline uses the shared Box theme contract:

```ts
downloads.setData({
  capabilities: { colorLevel: 1 },
  label: 'Downloads',
  theme,
  tone: 'success',
  values: [2, 4, 6, 8],
  width: 20,
});
```

`tone` controls foreground color. `backgroundTone` and `borderTone` are also
available. Explicit Blessed styles win. Semantic colors become undefined in
no-color mode.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `values` | `readonly number[]` | Required | Ordered finite numeric samples. |
| `width` | `number` | Required | Positive integer maximum sample count. |
| `min` | `number` | Series minimum | Lower domain bound. |
| `max` | `number` | Series maximum | Upper domain bound. |
| `characters` | `readonly string[]` | `▁▂▃▄▅▆▇█` | Ordered low-to-high glyph scale. |
| `emptyText` | `string` | `No data` | Output for an empty series. |
| `label` | `string` | — | Heading label. |
| `value` | `string \| number` | — | Primary heading value. |
| `summary` | `string` | — | Text appended after the graph. |
| `tone` | `keyof ThemeColors` | `foreground` | Semantic foreground color. |
| `backgroundTone` | `keyof ThemeColors` | `background` | Semantic background color. |
| `borderTone` | `keyof ThemeColors` | `border` | Semantic border color. |

## Terminal compatibility

- Glyphs should occupy one terminal cell.
- Use custom ASCII glyphs when Unicode support is unavailable.
- Text remains literal because the Blessed adapter disables tags.
- The component is display-only and never receives focus.
- Do not communicate meaning through glyph height or color alone; include
  labels, values, or summaries when context matters.

## Tree shaking

Use the pure entry when no Blessed element is needed:

```ts
import { renderSparkline } from 'blessed-components/sparkline';
```

Import the adapter separately:

```ts
import { sparkline } from 'blessed-components/sparkline/blessed';
```
