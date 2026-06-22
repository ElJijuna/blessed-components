# Spinner

Indeterminate terminal activity indicator with deterministic rendering and
owned animation lifecycle.

## Features

- Pure deterministic frame renderer.
- Unicode Braille frames.
- Automatic ASCII adapter fallback.
- Safe optional label.
- Custom one-cell frames.
- Manual `tick()` plus controlled `start()` and `stop()`.
- Shared Box theming.
- Timer cleanup on `destroy()`.

## Installation

```sh
npm install blessed blessed-components
```

## Pure renderer

```ts
import { renderSpinner } from 'blessed-components/spinner';

renderSpinner({
  frame: 2,
  label: 'Loading',
});
// "⠹ Loading"
```

`frame` is a non-negative integer and wraps around available frames. Labels
are stripped of ANSI sequences and Blessed tags.

### ASCII

```ts
import { SPINNER_ASCII_FRAMES, renderSpinner } from 'blessed-components/spinner';

renderSpinner({
  frame: 1,
  frames: SPINNER_ASCII_FRAMES,
  label: 'Loading',
});
// "/ Loading"
```

Every frame must occupy exactly one terminal cell.

## Blessed adapter

```ts
import { spinner } from 'blessed-components/spinner/blessed';

const loading = spinner({
  parent: screen,
  box: {
    top: 2,
    left: 3,
    width: 30,
    height: 1,
  },
  data: {
    label: 'Deploying',
    tone: 'primary',
    onFrame() {
      screen.render();
    },
  },
});

screen.render();
```

Spinner starts automatically by default. It updates element content but never
calls `screen.render()` itself. Use `onFrame` or an existing application render
loop to flush frames.

## Animation control

```ts
loading.stop();
loading.tick();
screen.render();
loading.start();
```

Handle API:

- `running` — whether interval timer is active;
- `start()` — start owned timer, idempotent;
- `stop()` — stop owned timer, idempotent;
- `tick()` — advance one deterministic frame;
- `setData()` — replace data, preserving running/stopped state;
- `destroy()` — stop timer and detach element.

Default interval is `80` milliseconds. `interval` must be a positive integer.

## Capabilities

Adapter detects Unicode support:

- Unicode: `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏`
- ASCII: `|/-\`

Pass `capabilities` for deterministic tests. Explicit `frames` override both
presets.

## Theming

Default foreground tone is `primary`. Spinner supports:

- `tone`
- `backgroundTone`
- `borderTone`
- `theme`
- `capabilities`

Explicit Blessed styles win. No-color mode removes semantic colors.

## Accessibility

- Always provide a label or adjacent status text.
- Spinner animation must not be sole indication of current activity.
- Spinner receives no focus or keyboard input.
- ASCII/no-color modes preserve label meaning.

## Timer ownership

Spinner owns only its interval timer. `destroy()` always clears it. Timer is
unreferenced so it cannot keep a Node.js process alive.

## Tree shaking

```ts
import { renderSpinner } from 'blessed-components/spinner';
import { spinner } from 'blessed-components/spinner/blessed';
```
