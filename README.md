# blessed-components

Composable, typed terminal UI components for
[Blessed](https://github.com/chjj/blessed).

> **Project status:** early development. `Badge`, `MetricBars`, `ProgressBar`,
> `Sparkline`, and `Stat` are available; more components are coming soon.

## Goals

- Small, consistent component APIs.
- Deterministic renderers that can be tested without a terminal.
- Thin adapters for Blessed elements and lifecycle.
- Responsive layouts for narrow terminals.
- Unicode, ASCII, color, and no-color modes.
- TypeScript types included with every release.

## Installation

```sh
npm install blessed blessed-components
```

`blessed` is a peer dependency.

## Coming soon

### Core components

| Component     | Purpose                                              | Priority |
| ------------- | ---------------------------------------------------- | -------- |
| [`ProgressBar`](./src/components/progress-bar/README.md) | Render one bounded horizontal progress bar. | Available |
| [`Sparkline`](./src/components/sparkline/README.md) | Render compact time-series data with Unicode blocks. | Available |
| [`MetricBars`](./src/components/metric-bars/README.md) | Render labeled metrics as aligned progress bars. | Available |
| [`Stat`](./src/components/stat/README.md) | Display a label, value, trend, and description. | Available |

### Composition

| Component  | Purpose                                               | Priority |
| ---------- | ----------------------------------------------------- | -------- |
| `Card`     | Frame content with an optional title and footer.      | P1       |
| `KeyValue` | Display aligned label/value rows.                     | P1       |
| [`Badge`](./src/components/badge/README.md) | Display compact semantic status text. | Available |
| `Divider`  | Separate terminal content horizontally or vertically. | P1       |
| `Stack`    | Arrange components with consistent spacing.           | P2       |

### Feedback and live data

| Component   | Purpose                                            | Priority |
| ----------- | -------------------------------------------------- | -------- |
| `Spinner`   | Show ongoing work.                                 | P1       |
| `Status`    | Display semantic state and optional details.       | P1       |
| `Alert`     | Display informational, warning, or error messages. | P1       |
| `LogViewer` | Stream and retain bounded log output.              | P1       |
| `Timer`     | Display elapsed or remaining time.                 | P1       |

### Data visualization

| Component   | Purpose                               | Priority |
| ----------- | ------------------------------------- | -------- |
| `Table`     | Display structured tabular data.      | P1       |
| `BarChart`  | Compare categorical values.           | P2       |
| `LineChart` | Display one or more time series.      | P2       |
| `Histogram` | Display value distributions.          | P2       |
| `Tree`      | Navigate hierarchical data.           | P3       |
| `Heatmap`   | Display dense two-dimensional values. | P3       |

### Interaction

| Component        | Purpose                      | Priority |
| ---------------- | ---------------------------- | -------- |
| `Tabs`           | Switch between views.        | P2       |
| `Menu`           | Navigate a list of actions.  | P2       |
| `Select`         | Choose one or more values.   | P3       |
| `TextField`      | Enter and validate text.     | P3       |
| `Form`           | Compose terminal inputs.     | P3       |
| `CommandPalette` | Search and execute commands. | P3       |

See [ROADMAP.md](./ROADMAP.md) for milestones, proposed APIs, and TDD strategy.

## Architecture

```text
src/
  core/         framework-independent rendering primitives
  components/   pure component renderers
  adapters/     Blessed widget adapters
tests/
  public-api/           behavior through exported APIs
  blessed-integration/  integration with real Blessed elements
examples/
  dashboard/            executable component showcase
```

Renderers remain independent from Blessed. Adapters own element updates,
listeners, timers, and cleanup.

### Core utilities

The framework-independent core provides terminal-aware text measurement,
truncation, wrapping, cropping, numeric scaling, series sampling, formatting,
capability detection, character sets, themes, events, focus, keymaps, layout,
and render models.

Import the complete core:

```ts
import { formatBytes, truncateText, visibleWidth } from 'blessed-components/core';
```

Or use focused, tree-shakable subpaths:

```ts
import { sampleSeries } from 'blessed-components/core/scale';
import { visibleWidth } from 'blessed-components/core/width';
```

See the [core reference](./src/core/README.md).

### Headless primitives

Primitives compose core algorithms into reusable behavior without choosing
presentation or creating Blessed elements:

- `Collection` provides stable ordered identity and enabled-item navigation.
- `Selection` provides single and multiple selection state.
- `FocusScope` captures, traps, and restores focus identifiers.
- `Viewport` provides bounded two-dimensional offsets and visibility.
- `ScrollArea` provides line, page, and scrollbar behavior.
- `Overlay` provides layer ordering, modal blocking, Escape dismissal, and
  focus-return metadata.

```ts
import { createSelectionModel } from 'blessed-components/primitives/selection';

const selection = createSelectionModel({
  items: [
    { id: 'one' },
    { id: 'two' },
  ],
});

selection.select('two');
```

See the [primitives reference](./src/primitives/README.md).

## Development

Requires Node.js 22.14 or newer.

```sh
npm install
npm run validate
```

Useful commands:

```sh
npm run build
npm run docs
npm run docs:check
npm test
npm run test:watch
npm run lint
npm run lint:fix
npm run biome:check
npm run preview
npm run typecheck
npm run format
npm run format:check
```

ESLint and Biome extend the shared `super-configs` presets. Biome owns
formatting and import organization; Prettier is not used.

### Terminal component preview

Run the prototype component workbench:

```sh
npm run preview
```

Use arrow keys and Enter to select stories, `r` to reload, `Tab` to move
focus, and `q` to quit. The prototype previews Badge, MetricBars, ProgressBar,
Sparkline, and Stat stories through their public Blessed adapters.

## Testing

Development follows vertical TDD slices:

1. Add one failing test for public behavior.
2. Add minimum implementation needed to pass.
3. Refactor while tests remain green.
4. Repeat with next behavior.

Tests should use public interfaces and observable output. Internal mocks and
large snapshots are avoided.

## Releases and documentation

`semantic-release` publishes packages from `main`. After a real npm release
succeeds, the same workflow generates TypeDoc for the released version and
deploys `docs/api` to GitHub Pages. Commits that produce no release do not
deploy documentation.

Each release also updates [CHANGELOG.md](./CHANGELOG.md) and commits the
generated changelog and package version with a `[skip ci]` release commit.

## License

[MIT](./LICENSE)
