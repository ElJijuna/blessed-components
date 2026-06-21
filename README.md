# blessed-components

Composable, typed terminal UI components for
[Blessed](https://github.com/chjj/blessed).

> **Project status:** early development. `ProgressBar` and `Sparkline` are
> available; more components are coming soon.

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
| `MetricBars`  | Render labeled metrics as aligned progress bars.     | P0       |
| `Stat`        | Display a label and highlighted value.               | P0       |

### Composition

| Component  | Purpose                                               | Priority |
| ---------- | ----------------------------------------------------- | -------- |
| `Card`     | Frame content with an optional title and footer.      | P1       |
| `KeyValue` | Display aligned label/value rows.                     | P1       |
| `Badge`    | Display compact semantic status text.                 | P1       |
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
npm run typecheck
npm run format
npm run format:check
```

ESLint and Biome extend the shared `super-configs` presets. Biome owns
formatting and import organization; Prettier is not used.

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

## License

[MIT](./LICENSE)
