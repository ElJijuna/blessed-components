# ProgressBar

Render a bounded numeric value as a fixed-width terminal progress track.

## Features

- Pure renderer usable without a live terminal.
- Blessed adapter with explicit update and destroy methods.
- Custom numeric ranges.
- Automatic clamping.
- Unicode defaults and custom ASCII characters.
- Custom labels and value formatting.
- Dedicated subpath exports for tree shaking.
- No automatic `screen.render()` calls.

## Installation

```sh
npm install blessed blessed-components
```

`blessed` is a peer dependency.

## Pure renderer

Importing this entry does not load Blessed:

```ts
import { renderProgressBar } from 'blessed-components/progress-bar';

const output = renderProgressBar({
  label: 'Quality',
  value: 78,
  width: 16,
});

// Quality ████████████░░░░ 78%
```

### Custom range

```ts
renderProgressBar({
  min: 10,
  max: 20,
  value: 15,
  width: 10,
});

// █████░░░░░ 50%
```

### ASCII mode

```ts
renderProgressBar({
  characters: {
    filled: '#',
    empty: '-',
  },
  value: 50,
  width: 10,
});

// #####----- 50%
```

### Custom value

```ts
renderProgressBar({
  formatValue: ({ value }) => `${value} files`,
  label: 'Uploaded',
  value: 25,
  width: 8,
});

// Uploaded ██░░░░░░ 25 files
```

## Blessed adapter

Use the separate Blessed entry when an element is needed:

```ts
import blessed from 'blessed';
import { progressBar } from 'blessed-components/progress-bar/blessed';

const screen = blessed.screen({ smartCSR: true });

const upload = progressBar({
  parent: screen,
  box: {
    top: 0,
    left: 0,
    width: 40,
    height: 1,
  },
  data: {
    label: 'Uploaded',
    value: 25,
    width: 20,
  },
});

screen.render();

upload.setData({
  label: 'Uploaded',
  value: 75,
  width: 20,
});

screen.render();

upload.destroy();
```

The adapter owns only its `BoxElement`. It updates content through `setData`
and detaches the element through `destroy`. Rendering remains the caller's
responsibility, allowing multiple updates to be batched.

## Renderer API

### `renderProgressBar(options)`

Returns a plain string.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | Required | Current numeric value. |
| `width` | `number` | Required | Positive integer track width in characters. |
| `min` | `number` | `0` | Lower bound. |
| `max` | `number` | `100` | Upper bound. |
| `label` | `string` | — | Text rendered before the track. |
| `characters` | `{ filled: string; empty: string }` | `█`, `░` | Single-cell track characters. |
| `formatValue` | `(context) => string` | Percentage | Formats trailing value text. |

`value` is clamped to `[min, max]`. `max` must be greater than `min`.

`formatValue` receives:

```ts
interface ProgressBarValueContext {
  percentage: number;
  value: number;
}
```

`value` in this context is the clamped value.

## Adapter API

### `progressBar(options)`

| Option | Type | Description |
| --- | --- | --- |
| `parent` | `blessed.Widgets.Node` | Parent Blessed node. |
| `data` | `RenderProgressBarOptions` | Renderer data. |
| `box` | `ProgressBarBoxOptions` | Blessed box options except `parent`, `content`, and `tags`. |

Returns:

```ts
interface ProgressBarHandle {
  readonly element: blessed.Widgets.BoxElement;
  setData(data: RenderProgressBarOptions): void;
  destroy(): void;
}
```

## Accessibility and terminal compatibility

- Do not communicate state through color alone; percentage text is enabled by
  default.
- Use ASCII characters when Unicode block glyphs are unavailable.
- Keep labels concise for narrow terminals.
- The component is display-only and does not receive focus or keyboard input.
- Call `screen.render()` after updates when visible output should be flushed.

## Tree shaking

Prefer the narrowest import:

```ts
import { renderProgressBar } from 'blessed-components/progress-bar';
```

The pure entry contains no Blessed import. Import the adapter only when needed:

```ts
import { progressBar } from 'blessed-components/progress-bar/blessed';
```
