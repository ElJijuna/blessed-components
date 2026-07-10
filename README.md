# blessed-components

Composable, typed terminal UI components for
[Blessed](https://github.com/chjj/blessed).

> **Project status:** early development. `Alert`, `Badge`, `Box`, `Button`, `Card`,
> `Dialog`, `Divider`, `EmptyState`, `ErrorState`, `Heading`, `Kbd`, `KeyValue`, `Label`, `List`, `MetricBars`, `MutedText`, `ProgressBar`,
> `ProgressList`, `ProgressStack`, `ScrollArea`, `Sparkline`, `Spinner`, `Stack`, `Stat`, `Status`,
> `MenuBar`, `NavigationList`, `Pager`, `Pagination`, `StepIndicator`, `TaskProgress`, `Text`, `Trend`, `Viewport`,
> `DateInput`, `TimeInput`, `PromptDialog`, `Tooltip`, `ToastViewport`, `Countdown`, `Schedule`,
> `CodeViewer`, `DiffViewer`, `StackTrace`, `EnvironmentTable`, `ShortcutRecorder`, `EventLog`,
> `CommandOutput`, `TerminalPane`, `QrCode`, `SplitPane`, `Skeleton`, `VirtualTable`,
> `BarChart`, `LineChart`, `Heatmap`, `ContextMenu`, `Carousel`, `FilePicker`, `Popover`,
> `TestResults`, `BuildStatus`, `GitStatus`, `CommitList`, `DependencyTree`, `AspectRatio`,
> `Resizable`, `Pill`, `Rating`, `NotificationCenter`, `TreeTable`, `ProcessList`,
> `HexViewer`, `AnsiViewer`, `StackedBarChart`, `AreaChart`, `ScatterPlot`, `BoxPlot`,
> `Donut`, `CandlestickChart`, `WaterfallChart`, `RequestInspector`, `QueryResults`,
> `PerformancePanel`, `ProcessRunner`, `ProcessTable`, `TaskRunner`, `REPL`,
> `ShellHistory`, `MarkdownViewer`, `RichText`, `Image`, `BigText`, `Calendar`,
> `DateRangePicker`, and `Gantt` are available.

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
| [`AspectRatio`](./src/components/layout/aspect-ratio/README.md) | Preserve terminal-cell proportions. | Available |
| [`Resizable`](./src/components/layout/resizable/README.md) | Clamp and render one resizable region. | Available |
| [`SplitPane`](./src/components/layout/split-pane/README.md) | Render horizontal or vertical region allocation. | Available |
| [`ScrollArea`](./src/components/layout/scroll-area/README.md) | Scroll vertical content with keyboard and mouse. | Available |
| [`Viewport`](./src/components/layout/viewport/README.md) | Clip and translate larger two-dimensional content. | Available |

### Feedback and live data

| Component   | Purpose                                            | Priority |
| ----------- | -------------------------------------------------- | -------- |
| [`Spinner`](./src/components/feedback/spinner/README.md) | Show ongoing work with controlled animation. | Available |
| [`ProgressList`](./src/components/feedback/progress-list/README.md) | Display multiple labeled progress rows. | Available |
| [`ProgressStack`](./src/components/feedback/progress-stack/README.md) | Display segmented progress across categories. | Available |
| [`Skeleton`](./src/components/feedback/skeleton/README.md) | Display loading placeholder rows. | Available |
| [`NotificationCenter`](./src/components/feedback/notification-center/README.md) | Display persistent notifications and unread state. | Available |
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
| [`Pill`](./src/components/data-display/pill/README.md) | Display compact capped labels. | Available |
| [`Rating`](./src/components/data-display/rating/README.md) | Display discrete scores with numeric fallback. | Available |
| [`LogViewer`](./src/components/collections/log-viewer/README.md) | Stream and retain bounded log output. | Available |
| [`Timer`](./src/components/data-display/timer/README.md) | Display elapsed or remaining time. | Available |

### Data visualization

| Component   | Purpose                               | Priority |
| ----------- | ------------------------------------- | -------- |
| [`Table`](./src/components/collections/table/README.md) | Display structured tabular data. | Available |
| [`TreeTable`](./src/components/collections/tree-table/README.md) | Display hierarchical rows plus columns. | Available |
| [`ProcessList`](./src/components/collections/process-list/README.md) | Display PID, CPU, memory, status, and command. | Available |
| [`HexViewer`](./src/components/collections/hex-viewer/README.md) | Display byte offsets, hex, and ASCII text. | Available |
| [`AnsiViewer`](./src/components/collections/ansi-viewer/README.md) | Safely display ANSI-formatted output. | Available |
| [`VirtualTable`](./src/components/collections/virtual-table/README.md) | Render a bounded row window from large tables. | Available |
| [`BarChart`](./src/components/visualization/bar-chart/README.md) | Compare categorical values. | Available |
| [`StackedBarChart`](./src/components/visualization/stacked-bar-chart/README.md) | Compare category composition. | Available |
| [`LineChart`](./src/components/visualization/line-chart/README.md) | Display one or more sampled time series. | Available |
| [`AreaChart`](./src/components/visualization/area-chart/README.md) | Display a filled sampled trend. | Available |
| [`ScatterPlot`](./src/components/visualization/scatter-plot/README.md) | Display x/y relationships. | Available |
| [`BoxPlot`](./src/components/visualization/box-plot/README.md) | Display statistical summaries. | Available |
| [`Donut`](./src/components/visualization/donut/README.md) | Display part-to-whole summaries. | Available |
| [`CandlestickChart`](./src/components/visualization/candlestick-chart/README.md) | Display OHLC rows. | Available |
| [`WaterfallChart`](./src/components/visualization/waterfall-chart/README.md) | Display sequential contributions. | Available |
| [`Histogram`](./src/components/visualization/histogram/README.md) | Display value distributions. | Available |
| [`Tree`](./src/components/collections/tree/README.md) | Navigate hierarchical data. | Available |
| [`Heatmap`](./src/components/visualization/heatmap/README.md) | Display dense two-dimensional values. | Available |

### Interaction

| Component        | Purpose                      | Priority |
| ---------------- | ---------------------------- | -------- |
| [`Button`](./src/components/input/button/README.md) | Trigger a focusable terminal action. | Available |
| [`IconButton`](./src/components/input/icon-button/README.md) | Compact action with required text description. | Available |
| [`NumberField`](./src/components/input/number-field/README.md) | Numeric input with parsing, bounds, and step. | Available |
| [`PasswordField`](./src/components/input/password-field/README.md) | Masked input with reveal behavior. | Available |
| [`DateInput`](./src/components/input/date-input/README.md) | Parse and validate date text. | Available |
| [`TimeInput`](./src/components/input/time-input/README.md) | Parse and validate time text. | Available |
| [`Tabs`](./src/components/navigation/tabs/README.md) | Switch between views. | Available |
| [`Menu`](./src/components/navigation/menu/README.md) | Navigate a list of actions. | Available |
| [`MenuBar`](./src/components/navigation/menu-bar/README.md) | Navigate top-level horizontal menus. | Available |
| [`NavigationList`](./src/components/navigation/navigation-list/README.md) | Navigate routes or views with active state. | Available |
| [`Pager`](./src/components/navigation/pager/README.md) | Move to previous or next page. | Available |
| [`Pagination`](./src/components/navigation/pagination/README.md) | Move through bounded result pages. | Available |
| [`ContextMenu`](./src/components/navigation/context-menu/README.md) | Render anchored action choices. | Available |
| [`Carousel`](./src/components/navigation/carousel/README.md) | Render one active slide with position metadata. | Available |
| [`FilePicker`](./src/components/input/file-picker/README.md) | Render caller-provided filesystem entries. | Available |
| [`Select`](./src/components/input/select/README.md) | Choose one or more values. | Available |
| [`TextField`](./src/components/input/text-field/README.md) | Enter and validate text. | Available |
| [`Form`](./src/components/input/form/README.md) | Compose terminal inputs. | Available |
| [`CommandPalette`](./src/components/navigation/command-palette/README.md) | Search and execute commands. | Available |

### Overlays

| Component | Purpose | Priority |
| --- | --- | --- |
| [`Dialog`](./src/components/overlays/dialog/README.md) | Show modal content with trapped and restored focus. | Available |
| [`Drawer`](./src/components/overlays/drawer/README.md) | Show edge-attached temporary content. | Available |
| [`Spotlight`](./src/components/overlays/spotlight/README.md) | Search and launch actions or resources. | Available |
| [`PromptDialog`](./src/components/overlays/prompt-dialog/README.md) | Request one value in a modal flow. | Available |
| [`Popover`](./src/components/overlays/popover/README.md) | Show anchored temporary content. | Available |
| [`Tooltip`](./src/components/overlays/tooltip/README.md) | Show delayed contextual help. | Available |

### Developer tools

| Component | Purpose | Priority |
| --- | --- | --- |
| [`CodeViewer`](./src/components/developer-tools/code-viewer/README.md) | Render source with line numbers. | Available |
| [`DiffViewer`](./src/components/developer-tools/diff-viewer/README.md) | Render unified diff rows. | Available |
| [`StackTrace`](./src/components/developer-tools/stack-trace/README.md) | Render structured stack frames. | Available |
| [`EnvironmentTable`](./src/components/developer-tools/environment-table/README.md) | Render masked environment variables. | Available |
| [`ShortcutRecorder`](./src/components/developer-tools/shortcut-recorder/README.md) | Display captured terminal shortcuts. | Available |
| [`EventLog`](./src/components/developer-tools/event-log/README.md) | Render structured TUI events. | Available |
| [`CommandOutput`](./src/components/developer-tools/command-output/README.md) | Render read-only command output. | Available |
| [`TestResults`](./src/components/developer-tools/test-results/README.md) | Render test outcomes, durations, and failures. | Available |
| [`BuildStatus`](./src/components/developer-tools/build-status/README.md) | Render build phases and outcome. | Available |
| [`GitStatus`](./src/components/developer-tools/git-status/README.md) | Render branch and changed file groups. | Available |
| [`CommitList`](./src/components/developer-tools/commit-list/README.md) | Render commit summaries and refs. | Available |
| [`DependencyTree`](./src/components/developer-tools/dependency-tree/README.md) | Render dependency hierarchy and problems. | Available |
| [`RequestInspector`](./src/components/developer-tools/request-inspector/README.md) | Render HTTP request and response details. | Available |
| [`QueryResults`](./src/components/developer-tools/query-results/README.md) | Render database rows and execution metadata. | Available |
| [`PerformancePanel`](./src/components/developer-tools/performance-panel/README.md) | Render runtime performance counters. | Available |
| [`TerminalPane`](./src/components/terminal/terminal-pane/README.md) | Display a scrollable terminal session pane. | Available |
| [`ProcessRunner`](./src/components/terminal/process-runner/README.md) | Render command execution state. | Available |
| [`ProcessTable`](./src/components/terminal/process-table/README.md) | Render multiple managed process states. | Available |
| [`TaskRunner`](./src/components/terminal/task-runner/README.md) | Render named task state. | Available |
| [`REPL`](./src/components/terminal/repl/README.md) | Render prompt, history, and input. | Available |
| [`ShellHistory`](./src/components/terminal/shell-history/README.md) | Render searchable command history. | Available |

### Date, time, and content

| Component | Purpose | Priority |
| --- | --- | --- |
| [`Countdown`](./src/components/scheduling/countdown/README.md) | Display remaining time until completion. | Available |
| [`Calendar`](./src/components/scheduling/calendar/README.md) | Navigate and select dates. | Available |
| [`DateRangePicker`](./src/components/scheduling/date-range-picker/README.md) | Display a bounded date interval. | Available |
| [`Gantt`](./src/components/scheduling/gantt/README.md) | Display time-based task spans. | Available |
| [`Schedule`](./src/components/scheduling/schedule/README.md) | Display ordered upcoming events. | Available |
| [`QrCode`](./src/components/content/qr-code/README.md) | Render a supplied QR/module matrix. | Available |
| [`MarkdownViewer`](./src/components/content/markdown-viewer/README.md) | Render Markdown as terminal-safe text. | Available |
| [`RichText`](./src/components/content/rich-text/README.md) | Render styled spans as plain text. | Available |
| [`Image`](./src/components/content/image/README.md) | Render image fallback text with alt. | Available |
| [`BigText`](./src/components/content/big-text/README.md) | Render large-text fallback. | Available |
| [`ToastViewport`](./src/components/feedback/toast-viewport/README.md) | Position and manage toast notifications. | Available |

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

Current component source categories include `collections`, `content`,
`data-display`, `developer-tools`, `feedback`, `input`, `layout`, `overlays`,
`scheduling`, and `visualization`. Public npm subpaths remain
component-oriented, for example `blessed-components/list` and
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
