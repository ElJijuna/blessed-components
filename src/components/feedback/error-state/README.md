# ErrorState

Render a failed or unavailable state with optional cause and recovery text.

## Features

- Pure renderer with no Blessed import.
- Blessed adapter with `setData()` and `destroy()`.
- Safe message, cause, and retry text.
- Error marker by default.
- Width-aware wrapping and alignment.
- Optional height bounding.
- Shared Box theming.
- Tree-shakable subpath exports.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderErrorState } from 'blessed-components/error-state';

renderErrorState({
  message: 'Failed to load projects',
  cause: 'Connection refused',
  retry: 'Press r to retry',
  width: 40,
});
```

Message, cause, and retry text are stripped of ANSI sequences and Blessed tags.

## Blessed adapter

```ts
import { errorState } from 'blessed-components/error-state/blessed';

const error = errorState({
  parent: screen,
  box: {
    top: 0,
    left: 0,
    width: 44,
    height: 7,
    border: 'line',
  },
  data: {
    message: 'Failed to load projects',
    cause: 'Connection refused',
    retry: 'Press r to retry',
  },
});

screen.render();

error.setData({
  message: 'Service unavailable',
  retry: 'Try again later',
});
screen.render();

error.destroy();
```

The adapter derives missing width and height from the Blessed element and
never calls `screen.render()` itself.

## Renderer API

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `message` | `string` | Required | Non-empty primary error message. |
| `cause` | `string` | `undefined` | Optional underlying cause. |
| `retry` | `string` | `undefined` | Optional retry or recovery hint. |
| `width` | `number` | `undefined` | Maximum rendered cell width. |
| `height` | `number` | `undefined` | Maximum rendered line count. |
| `align` | `'left' \| 'center' \| 'right'` | `'center'` | Horizontal alignment. |
| `marker` | `string` | `'×'` | One-cell marker before the message. |
| `showMarker` | `boolean` | `true` | Whether to render the marker. |

## Theming

The Blessed adapter uses `danger` foreground and border by default. It also
supports:

- `tone`
- `backgroundTone`
- `borderTone`
- `theme`
- `capabilities`

Explicit Blessed styles win. No-color mode removes semantic colors.

## Tree shaking

```ts
import { renderErrorState } from 'blessed-components/error-state';
import { errorState } from 'blessed-components/error-state/blessed';
```
