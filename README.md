# blessed-components

Composable, typed terminal UI components for
[Blessed](https://github.com/chjj/blessed).

> **Project status:** early development. `Alert`, `Badge`, `Box`, `Button`, `Card`,
> `Dialog`, `Divider`, `EmptyState`, `ErrorState`, `Heading`, `Kbd`, `KeyValue`, `Label`, `List`, `MetricBars`, `MutedText`, `ProgressBar`,
> `ProgressList`, `ProgressStack`, `ScrollArea`, `Sparkline`, `Spinner`, `Stack`, `Stat`, `Status`,
> `NavigationList`, `Pager`, `Pagination`, `StepIndicator`, `TaskProgress`, `Text`, `Trend`, and `Viewport` are available; more
> components are coming soon.

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
| [`ProgressBar`](./src/components/feedback/progress-bar/README.md) | Render one bounded horizontal progress bar. | Available |
| [`Sparkline`](./src/components/visualization/sparkline/README.md) | Render compact time-series data with Unicode blocks. | Available |
| [`MetricBars`](./src/components/visualization/metric-bars/README.md) | Render labeled metrics as aligned progress bars. | Available |
| [`Stat`](./src/components/data-display/stat/README.md) | Display a label, value, trend, and description. | Available |
| [`KeyValue`](./src/components/data-display/key-value/README.md) | Display aligned label/value metadata. | Available |
| [`List`](./src/components/collections/list/README.md) | Navigate and select typed items with bounded rendering. | Available |
| [`Text`](./src/components/data-display/text/README.md) | Render safe, cell-aware terminal text. | Available |

### Composition

| Component  | Purpose                                               | Priority |
| ---------- | ----------------------------------------------------- | -------- |
| [`Box`](./src/components/layout/box/README.md) | Create a typed, themed container. | Available |
| [`Card`](./src/components/layout/card/README.md) | Compose a framed header, body, and footer. | Available |
| [`KeyValue`](./src/components/data-display/key-value/README.md) | Display aligned label/value rows. | Available |
| [`Badge`](./src/components/data-display/badge/README.md) | Display compact semantic status text. | Available |
| [`Divider`](./src/components/layout/divider/README.md) | Separate content horizontally or vertically. | Available |
| [`Stack`](./src/components/layout/stack/README.md) | Arrange children with direction, gap, and alignment. | Available |
| [`ScrollArea`](./src/components/layout/scroll-area/README.md) | Scroll vertical content with keyboard and mouse. | Available |
| [`Viewport`](./src/components/layout/viewport/README.md) | Clip and translate larger two-dimensional content. | Available |

### Feedback and live data

| Component   | Purpose                                            | Priority |
| ----------- | -------------------------------------------------- | -------- |
| [`Spinner`](./src/components/feedback/spinner/README.md) | Show ongoing work with controlled animation. | Available |
| [`ProgressList`](./src/components/feedback/progress-list/README.md) | Display multiple labeled progress rows. | Available |
| [`ProgressStack`](./src/components/feedback/progress-stack/README.md) | Display segmented progress across categories. | Available |
| [`Status`](./src/components/feedback/status/README.md) | Display semantic state and optional details. | Available |
| [`Alert`](./src/components/feedback/alert/README.md) | Display informational, warning, or error messages. | Available |
| [`EmptyState`](./src/components/feedback/empty-state/README.md) | Display an empty result message with optional action. | Available |
| [`ErrorState`](./src/components/feedback/error-state/README.md) | Display error details, cause, and retry text. | Available |
| [`Heading`](./src/components/data-display/heading/README.md) | Display hierarchical terminal heading styles. | Available |
| [`Kbd`](./src/components/data-display/kbd/README.md) | Display keyboard shortcuts consistently. | Available |
| [`Label`](./src/components/data-display/label/README.md) | Display stable labels for controls and values. | Available |
| [`MutedText`](./src/components/data-display/muted-text/README.md) | Display secondary information using semantic theme tokens. | Available |
| [`StepIndicator`](./src/components/feedback/step-indicator/README.md) | Display completed, active, and pending steps. | Available |
| [`TaskProgress`](./src/components/feedback/task-progress/README.md) | Display multi-step task status with current activity. | Available |
| [`Trend`](./src/components/data-display/trend/README.md) | Display up, down, and flat indicators with text fallback. | Available |
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
| [`Button`](./src/components/input/button/README.md) | Trigger a focusable terminal action. | Available |
| `Tabs`           | Switch between views.        | Available |
| `Menu`           | Navigate a list of actions.  | Available |
| [`NavigationList`](./src/components/navigation/navigation-list/README.md) | Navigate routes or views with active state. | Available |
| [`Pager`](./src/components/navigation/pager/README.md) | Move to previous or next page. | Available |
| [`Pagination`](./src/components/navigation/pagination/README.md) | Move through bounded result pages. | Available |
| `Select`         | Choose one or more values.   | P3       |
| `TextField`      | Enter and validate text.     | P3       |
| `Form`           | Compose terminal inputs.     | P3       |
| `CommandPalette` | Search and execute commands. | P3       |

### Overlays

| Component | Purpose | Priority |
| --- | --- | --- |
| [`Dialog`](./src/components/overlays/dialog/README.md) | Show modal content with trapped and restored focus. | Available |

See [ROADMAP.md](./ROADMAP.md) for milestones, proposed APIs, and TDD strategy.

## Architecture

```text
src/
  core/         framework-independent rendering primitives
  primitives/   headless interaction and state machines
  components/   categorized pure component renderers
  adapters/     Blessed widget adapters
tests/
  public-api/           behavior through exported APIs
  blessed-integration/  integration with real Blessed elements
examples/
  component-gallery/    interactive stories for every component
  dashboard/            composed service-dashboard template
  process-monitor/      live system metrics and lifecycle example
```

Renderers remain independent from Blessed. Adapters own element updates,
listeners, timers, and cleanup.

Current component source categories include `collections`, `data-display`,
`feedback`, `input`, `layout`, `overlays`, and `visualization`. Public npm subpaths
remain component-oriented, for example `blessed-components/list` and
`blessed-components/dialog`.

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

Run the component gallery:

```sh
npm run example:gallery
```

Use arrow keys and Enter to select stories, `r` to reload, `Tab` to move
focus, and `q` to quit. The prototype previews Badge, MetricBars, ProgressBar,
available component stories through their public Blessed adapters.

Run the composed application examples:

```sh
npm run example:dashboard
npm run example:process-monitor
```

Verify every example without an interactive terminal:

```sh
npm run examples:smoke
```

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
