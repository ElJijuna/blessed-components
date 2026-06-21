# Core

Framework-independent terminal primitives used by `blessed-components`.
Core modules never import Blessed and can be consumed independently through
tree-shakable package subpaths.

## Imports

```ts
import {
  createTheme,
  formatBytes,
  truncateText,
  visibleWidth,
} from 'blessed-components/core';
```

Prefer focused subpaths when an application needs only one capability:

```ts
import { sampleSeries, scaleValue } from 'blessed-components/core/scale';
import { visibleWidth } from 'blessed-components/core/width';
```

## Text

- `visibleWidth` measures terminal cells while ignoring ANSI sequences and
  Blessed tags.
- `sliceByWidth`, `truncateText`, `wrapText`, and `cropText` operate on terminal
  cells instead of JavaScript string length.
- `escapeBlessedTags` and `stripBlessedTags` make dynamic text safe and
  measurable.

```ts
visibleWidth('\u001B[31m红色\u001B[0m'); // 4
truncateText('deployment-ready', 10); // "deploymen…"
```

## Numeric domains and series

- `clamp` bounds finite values.
- `normalizeValue` maps a domain to `0..1`.
- `scaleValue` maps one numeric range into another.
- `sampleSeries` reduces ordered data using `max`, `min`, `first`, or `last`
  bucket strategies.

```ts
scaleValue(50, {
  domain: { min: 0, max: 100 },
  range: { min: 0, max: 20 },
}); // 10
```

## Formatting

Locale-aware formatters cover numbers, percentages, bytes, durations, rates,
and date/time values:

```ts
formatBytes(1536); // "1.5 KiB"
formatPercent(0.856); // "85.6%"
```

## Terminal policy

- `detectCapabilities` resolves color depth, Unicode, mouse, and TTY support.
- `createCharacterSet` selects Unicode or ASCII drawing characters.
- `createTheme` merges semantic colors and component overrides.
- `resolveThemeColor` disables color tokens when color output is unavailable.

Detection accepts explicit environment and platform values, making it
deterministic in tests and server processes.

## Interaction and layout

- `createEventBus` provides typed publish/subscribe events.
- `createKeymap` normalizes terminal key chords and exposes help metadata.
- `createFocusModel` moves through enabled items with optional wrapping.
- `insetRect` and `distributeSpace` provide deterministic layout calculations.

These modules model behavior only. Blessed adapters remain responsible for
turning raw terminal events and dimensions into core inputs.

## Render models

`renderToString` converts rows and cells into deterministic terminal text.
`diffRows` returns the row indexes that changed between two renders, allowing
adapters to avoid unnecessary high-frequency updates.

## Guarantees

- No Blessed dependency.
- No mutation of caller-owned arrays or objects.
- Deterministic behavior when explicit inputs are supplied.
- ESM, CommonJS, and TypeScript declarations for every public core subpath.
