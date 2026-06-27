# blessed-components — Roadmap

Composable, typed terminal UI components built on top of `blessed`.

## Vision

Turn manual strings, Blessed tags, Unicode glyphs, width calculations, keyboard
handling, and lifecycle cleanup into reusable components with:

- small, consistent public APIs;
- deterministic renderers;
- structured data instead of presentation strings;
- responsive behavior for narrow terminals;
- Unicode, ASCII, color, and no-color modes;
- predictable focus and keyboard interaction;
- direct integration with Blessed elements;
- tests through public behavior;
- no leaked listeners, timers, or processes.

## Product position

Blessed already provides low-level elements such as boxes, lists, forms,
prompts, tables, progress bars, logs, terminals, images, and layouts.
`blessed-contrib` adds dashboard-oriented charts, gauges, maps, sparklines,
tables, trees, Markdown, grids, and carousels.

This library should not become another collection of thin aliases.

Its advantage should be:

1. typed and consistent APIs;
2. pure renderers that work without a live terminal;
3. composition from small primitives;
4. responsive width and height behavior;
5. explicit controlled and uncontrolled state;
6. keyboard maps and focus contracts;
7. themes and semantic visual tokens;
8. lifecycle safety;
9. maintained tests and documentation;
10. optional adapters for existing Blessed capabilities.

## Artifact taxonomy

| Artifact  | Meaning in this project                               | Examples                      |
| --------- | ----------------------------------------------------- | ----------------------------- |
| Utility   | Non-visual, framework-independent logic.              | width, scale, format, keymaps |
| Primitive | One low-level terminal behavior with minimal styling. | focus scope, viewport         |
| Component | Reusable visual unit with useful defaults.            | progress bar, badge           |
| Pattern   | Documented composition solving recurring behavior.    | async state, confirm flow     |
| Block     | Opinionated application-level composition.            | process monitor, git status   |
| Template  | Complete terminal application scaffold.               | dashboard starter             |

Components belong in the npm package. Blocks and templates should remain
examples until repeated use proves a stable public API.

## Naming

The initial examples represent different components:

| Name          | Responsibility                                          |
| ------------- | ------------------------------------------------------- |
| `Sparkline`   | Compact time series using `▁▂▃▄▅▆▇█`.                   |
| `MetricBars`  | Labeled metrics rendered as aligned horizontal bars.    |
| `ProgressBar` | One bounded horizontal bar.                             |
| `BarChart`    | Comparison of categories or series.                     |
| `Stat`        | Label, highlighted value, and optional trend.           |
| `Card`        | Composable frame with header, body, and footer regions. |

`Sparkline`, `ProgressBar`, and `BarChart` must not be used as interchangeable
names.

## Proposed public API

Use two layers:

1. Pure renderers receive data and return Blessed-compatible content or render
   models.
2. Blessed adapters create elements, connect events, retain state, and expose
   lifecycle methods.

```ts
import {
  metricBars,
  renderMetricBars,
  renderSparkline,
  sparkline,
} from 'blessed-components'
```

### Pure renderer

```ts
const content = renderSparkline({
  label: 'Last 30 days',
  values: [1, 2, 3, 4, 3, 5, 6, 7, 8],
  summary: 'peak: 3.8M',
  width: 40,
})
```

### Blessed component

```ts
const downloads = sparkline({
  parent: screen,
  label: 'Weekly downloads',
  value: 25_200_000,
  values: downloadsByDay,
  summary: 'peak: 3.8M',
  top: 0,
  left: 0,
  width: 42,
  height: 7,
})

downloads.setData(nextDownloadsByDay)
```

### Metric bars

```ts
const score = metricBars({
  parent: screen,
  label: 'Overall',
  value: 85,
  metrics: [
    { label: 'Quality', value: 78 },
    { label: 'Popularity', value: 99 },
    { label: 'Maintenance', value: 82 },
  ],
  min: 0,
  max: 100,
})
```

## Design principles

- Separate data, rendering, and Blessed lifecycle.
- Keep pure renderers as the source of visual truth.
- Make Blessed adapters thin.
- Prefer composition over components with dozens of options.
- Reuse one scaling primitive across progress bars, gauges, and charts.
- Reuse one selection model across lists, tables, trees, menus, and palettes.
- Let callers decide when `screen.render()` runs.
- Calculate dimensions from actual inner width and height.
- Clamp bounded values.
- Never mutate caller-owned arrays or objects.
- Escape dynamic text before applying Blessed tags.
- Use semantic theme tokens, not hard-coded presentation tags.
- Export all public option, state, event, and handle types.
- Keep `blessed` as a peer dependency.
- Add dependencies only when they provide substantial value.

## State model

Interactive components should support both modes when useful:

- Controlled: caller supplies state and receives change events.
- Uncontrolled: component owns state from a `defaultValue`.

Examples:

```ts
select({ value, onValueChange })
select({ defaultValue })

tabs({ activeId, onActiveIdChange })
tabs({ defaultActiveId })
```

Do not add both modes to display-only components.

## Common component handle

Blessed adapters implement the published `BlessedComponentHandle` contract:

```ts
interface BlessedComponentHandle<TData, TElement> {
  readonly element: TElement
  setData(data: TData): void
  destroy(): void
}
```

Display adapters do not expose `focus()` because they are not interactive and
do not expose `render()` because applications own screen render batching.
Interactive handles may extend this contract with focused behavior.

## Target architecture

```text
src/
  core/
    capabilities.ts
    characters.ts
    color.ts
    crop.ts
    events.ts
    focus.ts
    format.ts
    keymap.ts
    layout.ts
    render-model.ts
    scale.ts
    tags.ts
    theme.ts
    truncate.ts
    width.ts
  primitives/
    collection/
    focus-scope/
    overlay/
    scroll-area/
    selection/
    viewport/
  components/
    collections/
    data-display/
    feedback/
    input/
    layout/
    navigation/
    visualization/
  adapters/
    blessed/
  blocks/
    examples-only/
  index.ts
tests/
  public-api/
  blessed-integration/
  terminal-fixtures/
examples/
  component-gallery/
  dashboard/
  process-monitor/
```

`core` must not import Blessed. `primitives` model shared behavior.
`components` compose core logic and primitives. `adapters/blessed` owns Blessed
elements and events.

Existing components are physically categorized without changing their public
npm subpaths:

| Source category  | Available components                      |
| ---------------- | ----------------------------------------- |
| `collections`    | `List`, `Table`                          |
| `data-display`   | `Badge`, `KeyValue`, `Stat`, `Text`       |
| `feedback`       | `ProgressBar`, `Spinner`                  |
| `visualization`  | `Gauge`, `Legend`, `MetricBars`, `Sparkline` |
| `input`          | `Button`                                  |
| `layout`         | `Box`, `Card`, `Divider`, `ScrollArea`, `Stack`, `Viewport` |
| `navigation`     | Reserved for navigation components       |
| `overlays`       | `Dialog`                                  |

Pure renderers own content and character overrides. Semantic color and style
tokens are applied by adapters, while terminal capability detection selects
safe defaults. This keeps core renderers deterministic and no-color friendly.

### Primitive implementation status

| Primitive     | Shared behavior                                             | Status    |
| ------------- | ----------------------------------------------------------- | --------- |
| `Collection`  | Ordered identity, lookup, disabled items, looping navigation | Available |
| `Selection`   | Single and multiple selection with deterministic ordering   | Available |
| `FocusScope`  | Focus capture, trapping, traversal, and restoration          | Available |
| `Viewport`    | Two-dimensional bounds, resizing, and visibility             | Available |
| `ScrollArea`  | Line/page movement and scrollbar metrics                     | Available |
| `Overlay`     | Layer stack, modal blocking, Escape, and focus return        | Available |

## Component opportunity analysis

Legend:

- **Available**: implemented, documented, and published through public exports.
- **Build**: strong fit and clear differentiation.
- **Adapt**: wrap or compose existing Blessed behavior with better contracts.
- **Research**: valuable, but API or terminal behavior needs validation.
- **Defer**: expensive, niche, or already served well elsewhere.

### 1. Foundation utilities

These unlock almost every visual component and should be built first.

| Utility              | Purpose                                                   | Decision | Priority |
| -------------------- | --------------------------------------------------------- | -------- | -------- |
| `visibleWidth`       | Measure text while ignoring Blessed tags and ANSI codes.  | Available | P0       |
| `truncate`           | End, middle, and start truncation by terminal cell width. | Available | P0       |
| `wrapText`           | Cell-aware wrapping with indentation.                     | Available | P0       |
| `escapeTags`         | Prevent dynamic text from becoming Blessed markup.        | Available | P0       |
| `scaleValue`         | Map numeric domains into cell or glyph ranges.            | Available | P0       |
| `clamp`              | Bound values safely.                                      | Available | P0       |
| `sampleSeries`       | Downsample time-series data to available width.           | Available | P0       |
| `formatNumber`       | Locale-aware compact and full numbers.                    | Available | P0       |
| `formatPercent`      | Consistent percentages and precision.                     | Available | P0       |
| `formatBytes`        | IEC/SI byte formatting.                                   | Available | P1       |
| `formatDuration`     | Human and clock duration formats.                         | Available | P1       |
| `formatRate`         | Values per second or interval.                            | Available | P1       |
| `formatDateTime`     | Terminal-friendly timestamps.                             | Available | P1       |
| `detectCapabilities` | Unicode, color depth, mouse, and terminal features.       | Available | P1       |
| `createKeymap`       | Normalized key bindings with help metadata.               | Available | P1       |
| `createTheme`        | Merge semantic tokens and component overrides.            | Available | P1       |
| `renderToString`     | Render pure models for tests and static terminal output.  | Available | P1       |
| `diffRows`           | Identify changed rows for high-frequency updates.         | Available | P2       |

### 2. Layout and composition

Blessed has positioning and a basic layout element. Opportunity exists in
predictable, typed composition and responsive rules.

| Component       | Purpose                                                 | Decision | Priority |
| --------------- | ------------------------------------------------------- | -------- | -------- |
| `Box`           | Typed base container with theme defaults.               | Available | P1       |
| `Card`          | Root, header, title, description, body, footer.         | Available | P1       |
| `Stack`         | Vertical or horizontal flow with gaps.                  | Available | P1       |
| `Cluster`       | Wrapping inline group for badges and actions.           | Build    | P2       |
| `Grid`          | Responsive row/column placement with spans.             | Build    | P2       |
| `SplitPane`     | Resizable horizontal or vertical regions.               | Research | P2       |
| `SidebarLayout` | Sidebar plus main content with collapse rules.          | Build    | P2       |
| `Center`        | Center one child in available space.                    | Build    | P2       |
| `Spacer`        | Flexible or fixed empty space.                          | Build    | P2       |
| `Divider`       | Horizontal or vertical separator with optional label.   | Available | P1       |
| `AspectRatio`   | Preserve cell-aware proportions.                        | Research | P3       |
| `Viewport`      | Visual wrapper around the available headless primitive. | Available | P1       |
| `ScrollArea`    | Styled Blessed wrapper around the headless primitive.   | Available | P1       |
| `Resizable`     | Keyboard/mouse resize behavior for one region.          | Research | P3       |
| `Collapsible`   | Show or hide a region while preserving state.           | Build    | P2       |
| `Accordion`     | Multiple collapsible sections with keyboard navigation. | Build    | P2       |
| `Page`          | Full-screen region with title and action slots.         | Build    | P2       |
| `AppShell`      | Header, footer, sidebar, content, and overlay layers.   | Build    | P2       |

### 3. Typography and small data display

High value, low complexity, excellent early components.

| Component         | Purpose                                               | Decision | Priority |
| ----------------- | ----------------------------------------------------- | -------- | -------- |
| `Text`            | Safe themed text with truncation and wrapping.        | Available | P0       |
| `Heading`         | Hierarchical terminal heading styles.                 | Available | P1       |
| `Label`           | Stable labels for controls and values.                | Available | P1       |
| `MutedText`       | Secondary information using semantic theme tokens.    | Available | P1       |
| `Code`            | Inline code with safe escaping.                       | Build    | P2       |
| `Preformatted`    | Preserve whitespace with horizontal scroll policy.    | Build    | P2       |
| `Stat`            | Label, value, unit, trend, and description.           | Available | P0       |
| `KeyValue`        | Aligned label/value rows.                             | Available | P1       |
| `DescriptionList` | Responsive term/description groups.                   | Build    | P2       |
| `Badge`           | Compact semantic status.                              | Available | P1       |
| `Tag`             | Removable or static categorization token.             | Build    | P2       |
| `Pill`            | Rounded-character compact label where supported.      | Defer    | P3       |
| `Timestamp`       | Formatted absolute or relative time.                  | Build    | P2       |
| `Trend`           | Up/down/flat indicator with accessible text fallback. | Available | P1       |
| `Rating`          | Discrete score using symbols and text fallback.       | Research | P3       |
| `Kbd`             | Display keyboard shortcuts consistently.              | Available | P1       |
| `Breadcrumb`      | Current location path with truncation.                | Build    | P2       |

### 4. Progress, status, and feedback

These components share bounded values, semantic tones, and live updates.

| Component            | Purpose                                                 | Decision | Priority |
| -------------------- | ------------------------------------------------------- | -------- | -------- |
| `ProgressBar`        | One determinate horizontal progress bar.                | Available | P0       |
| `ProgressStack`      | Segmented progress across categories.                   | Available | P1       |
| `ProgressList`       | Multiple labeled progress rows.                         | Available | P1       |
| `Spinner`            | Indeterminate activity indicator.                       | Available | P1       |
| `Status`             | State icon, label, and optional detail.                 | Available | P1       |
| `Alert`              | Inline information, success, warning, or error message. | Available | P1       |
| `Callout`            | Framed explanatory content.                             | Build    | P2       |
| `Toast`              | Timed transient notification stack.                     | Build    | P2       |
| `NotificationCenter` | Persistent notification list and unread state.          | Research | P3       |
| `Skeleton`           | Placeholder rows while content loads.                   | Research | P2       |
| `EmptyState`         | Empty result message with optional action.              | Available | P1       |
| `ErrorState`         | Error details, cause, and retry action.                 | Available | P1       |
| `LoadingOverlay`     | Block interaction while work runs.                      | Build    | P2       |
| `TaskProgress`       | Multi-step task status with current activity.           | Available | P1       |
| `StepIndicator`      | Completed, active, and pending steps.                   | Available | P1       |
| `ConnectionStatus`   | Online, reconnecting, offline, latency.                 | Build    | P2       |
| `HealthIndicator`    | Service health summary with reasons.                    | Build    | P2       |

### 5. Collections and structured data

This family should share selection, focus, sorting, filtering, scrolling, and
virtualization primitives.

| Component      | Purpose                                                    | Decision    | Priority |
| -------------- | ---------------------------------------------------------- | ----------- | -------- |
| `List`         | Typed items, selection, empty state, and bounded rendering. | Available   | P1       |
| `VirtualList`  | Render large lists using visible rows only.                | Build       | P2       |
| `GroupedList`  | Sections with sticky or repeated headings.                 | Build       | P2       |
| `Table`        | Typed columns, alignment, truncation, and selection.       | Available   | P1       |
| `DataTable`    | Sort, filter, paginate, resize, and column visibility.     | Build       | P2       |
| `VirtualTable` | Large row sets with bounded rendering.                     | Research    | P2       |
| `Tree`         | Expandable hierarchical navigation.                        | Build       | P2       |
| `TreeTable`    | Hierarchical rows plus columns.                            | Research    | P3       |
| `Timeline`     | Ordered events with time and status.                       | Build       | P2       |
| `ActivityFeed` | Live events with grouping and retention.                   | Build       | P2       |
| `DiffView`     | Side-by-side or unified text differences.                  | Build       | P2       |
| `FileTree`     | File-specific tree with icons and git state.               | Build       | P2       |
| `ProcessList`  | PID, CPU, memory, status, and actions.                     | Block first | P3       |
| `LogViewer`    | Streaming logs with retention and pause.                   | Build       | P1       |
| `LogExplorer`  | Search, filters, levels, timestamps, and follow mode.      | Build       | P2       |
| `JsonViewer`   | Expandable structured JSON values.                         | Build       | P2       |
| `Inspector`    | Generic nested object inspection.                          | Build       | P2       |
| `HexViewer`    | Byte offsets, hex, and text representation.                | Defer       | P3       |
| `AnsiViewer`   | Safely display ANSI-formatted output.                      | Research    | P3       |

### 6. Charts and numeric visualization

Charts are useful but expensive. Build shared axes, domains, legends, and
sampling first. Avoid duplicating `blessed-contrib` without a measurable API,
quality, or maintenance advantage.

| Component          | Purpose                                             | Decision     | Priority |
| ------------------ | --------------------------------------------------- | ------------ | -------- |
| `Sparkline`        | Compact single-series trend.                        | Available    | P0       |
| `MultiSparkline`   | Aligned compact series with labels.                 | Build        | P1       |
| `MetricBars`       | Labeled horizontal metric bars.                     | Available    | P0       |
| `Gauge`            | One bounded value with label and thresholds.        | Available    | P1       |
| `StackedGauge`     | Composition of portions in one track.               | Build        | P2       |
| `BulletChart`      | Actual value against target and qualitative ranges. | Build        | P2       |
| `BarChart`         | Categorical value comparison.                       | Research     | P2       |
| `StackedBarChart`  | Category composition over multiple series.          | Research     | P3       |
| `LineChart`        | One or more series over an axis.                    | Research     | P2       |
| `AreaChart`        | Filled time-series trend.                           | Defer        | P3       |
| `Histogram`        | Numeric distribution by bins.                       | Build        | P2       |
| `Heatmap`          | Dense matrix of intensity values.                   | Research     | P3       |
| `CalendarHeatmap`  | Activity intensity by date.                         | Build        | P3       |
| `ScatterPlot`      | Relationship between two numeric values.            | Defer        | P3       |
| `BoxPlot`          | Statistical distribution summary.                   | Defer        | P3       |
| `Donut`            | Part-to-whole radial display.                       | Defer        | P3       |
| `PieChart`         | Part-to-whole radial display.                       | Do not build | —        |
| `CandlestickChart` | Open/high/low/close financial series.               | Defer        | P3       |
| `WaterfallChart`   | Sequential positive and negative contributions.     | Defer        | P3       |
| `Legend`           | Shared series labels and glyphs.                    | Available    | P1       |
| `Axis`             | Shared numeric/category axis renderer.              | Build        | P2       |
| `Thresholds`       | Shared warning and critical ranges.                 | Build        | P1       |

`PieChart` is a non-goal: terminal cell aspect ratios and low resolution make
angle and area comparison poor. Prefer `MetricBars`, `ProgressStack`, or
`Donut` only when visual familiarity outweighs precision.

### 7. Navigation

Navigation components need a shared focus model and documented keyboard maps.

| Component        | Purpose                                        | Decision | Priority |
| ---------------- | ---------------------------------------------- | -------- | -------- |
| `Tabs`           | Switch between labeled views.                  | Build    | P1       |
| `TabList`        | Compound tab trigger collection.               | Build    | P1       |
| `Menu`           | Vertical action navigation.                    | Build    | P1       |
| `MenuBar`        | Top-level horizontal menus.                    | Build    | P2       |
| `ContextMenu`    | Mouse or keyboard anchored action menu.        | Research | P3       |
| `NavigationList` | Route or view navigation with active state.    | Build    | P2       |
| `Pagination`     | Move through bounded result pages.             | Build    | P2       |
| `Pager`          | Previous/next navigation for views or records. | Build    | P2       |
| `Carousel`       | Manual or timed view rotation.                 | Adapt    | P3       |
| `CommandPalette` | Searchable command execution.                  | Build    | P2       |
| `QuickSwitcher`  | Search and switch resources or views.          | Build    | P2       |
| `HelpOverlay`    | Searchable keyboard shortcut reference.        | Build    | P1       |

### 8. Inputs and forms

Blessed already has form elements. Value comes from typed values, validation,
consistent state, composition, and cleanup.

| Component         | Purpose                                                | Decision | Priority |
| ----------------- | ------------------------------------------------------ | -------- | -------- |
| `Button`          | Typed action with tone and disabled states.            | Available | P1       |
| `IconButton`      | Compact action with required text description.         | Build    | P2       |
| `TextField`       | Single-line text with label, hint, and error.          | Adapt    | P1       |
| `PasswordField`   | Masked input with reveal behavior.                     | Build    | P2       |
| `TextArea`        | Multiline text with validation and counters.           | Adapt    | P2       |
| `NumberField`     | Numeric input with parsing, bounds, and step.          | Build    | P2       |
| `SearchField`     | Query input with clear and submit actions.             | Build    | P1       |
| `Checkbox`        | Boolean value with indeterminate state.                | Adapt    | P1       |
| `RadioGroup`      | One value from visible choices.                        | Adapt    | P1       |
| `Switch`          | Immediate boolean setting.                             | Build    | P2       |
| `Select`          | One value from a popup or inline list.                 | Build    | P1       |
| `MultiSelect`     | Multiple values with filtering.                        | Build    | P2       |
| `Combobox`        | Searchable input plus suggestions.                     | Build    | P2       |
| `Autocomplete`    | Suggest completions while typing.                      | Build    | P2       |
| `DateInput`       | Parse and validate a date string.                      | Research | P3       |
| `TimeInput`       | Parse and validate time.                               | Research | P3       |
| `KeybindingInput` | Capture and display shortcut combinations.             | Build    | P3       |
| `FilePicker`      | Navigate and select files or directories.              | Adapt    | P2       |
| `FormField`       | Label, control, hint, required, and error composition. | Build    | P1       |
| `Form`            | Submission, validation, reset, and field registry.     | Adapt    | P1       |

### 9. Overlays and transient UI

Terminal overlays require layering, focus capture, focus restoration, and
global key cleanup.

| Component       | Purpose                                         | Decision | Priority |
| --------------- | ----------------------------------------------- | -------- | -------- |
| `Overlay`       | Visual screen layer over the available stack primitive. | Build    | P1       |
| `Dialog`        | Modal content with focus capture and restore.   | Available | P1       |
| `ConfirmDialog` | Confirm or cancel a consequential action.       | Build    | P1       |
| `PromptDialog`  | Request one value in a modal flow.              | Adapt    | P2       |
| `Drawer`        | Edge-attached temporary panel.                  | Build    | P2       |
| `Popover`       | Anchored temporary content.                     | Research | P3       |
| `Tooltip`       | Delayed contextual help.                        | Adapt    | P3       |
| `ToastViewport` | Position and manage toast notifications.        | Build    | P2       |
| `Spotlight`     | Full-screen searchable action/resource overlay. | Build    | P2       |

### 10. Developer-tool components

Strong opportunity: terminal applications are frequently developer tools.
These components can differentiate the package from generic dashboard
libraries.

| Component          | Purpose                                             | Decision    | Priority |
| ------------------ | --------------------------------------------------- | ----------- | -------- |
| `CodeViewer`       | Syntax-highlighted, scrollable source.              | Build       | P2       |
| `DiffViewer`       | Unified or split patch rendering.                   | Build       | P2       |
| `StackTrace`       | Parse and navigate stack frames.                    | Build       | P2       |
| `TestResults`      | Suites, tests, failures, duration, and retry state. | Block first | P2       |
| `BuildStatus`      | Build phases, duration, logs, and outcome.          | Block first | P2       |
| `GitStatus`        | Branch, staged, modified, untracked, conflicts.     | Block first | P2       |
| `CommitList`       | Commit summary, author, date, and refs.             | Block first | P3       |
| `DependencyTree`   | Package dependency hierarchy and problems.          | Block first | P3       |
| `RequestInspector` | HTTP request/response headers and body.             | Block first | P3       |
| `QueryResults`     | Database result table and execution metadata.       | Block first | P3       |
| `EnvironmentTable` | Masked environment variable inspection.             | Build       | P3       |
| `ShortcutRecorder` | Inspect keypress names emitted by terminal.         | Build       | P3       |
| `EventLog`         | Structured event stream for debugging TUI behavior. | Build       | P2       |
| `PerformancePanel` | FPS, render time, memory, and event-loop delay.     | Research    | P3       |

### 11. Terminal and process components

High power, high lifecycle and security cost.

| Component       | Purpose                                         | Decision    | Priority |
| --------------- | ----------------------------------------------- | ----------- | -------- |
| `TerminalPane`  | Embed a subprocess terminal.                    | Adapt       | P3       |
| `ProcessRunner` | Run command, stream output, expose exit state.  | Research    | P3       |
| `ProcessTable`  | Monitor multiple child processes.               | Block first | P3       |
| `CommandOutput` | Read-only stdout/stderr viewer with status.     | Build       | P2       |
| `TaskRunner`    | Execute named tasks with logs and cancellation. | Block first | P3       |
| `REPL`          | Prompt, history, evaluation, and results.       | Research    | P3       |
| `ShellHistory`  | Search and select previous commands.            | Research    | P3       |

Process APIs must never execute shell strings implicitly. Commands, arguments,
environment, cancellation, and signal behavior require explicit contracts.

### 12. Content and media

Useful, but dependency-heavy features should remain optional entry points.

| Component        | Purpose                                                | Decision | Priority |
| ---------------- | ------------------------------------------------------ | -------- | -------- |
| `MarkdownViewer` | Render Markdown into terminal-safe content.            | Research | P3       |
| `RichText`       | Styled spans, links, and selectable text.              | Research | P3       |
| `Link`           | Visible URL plus optional terminal hyperlink sequence. | Build    | P2       |
| `Image`          | Capability-aware terminal image or text fallback.      | Adapt    | P3       |
| `AsciiArt`       | Render static art with alignment and cropping.         | Build    | P3       |
| `BigText`        | Large glyph text through Blessed.                      | Adapt    | P3       |
| `QRCode`         | Render QR codes using terminal cells.                  | Build    | P3       |
| `ColorSwatch`    | Show terminal color and numeric representation.        | Build    | P3       |
| `Palette`        | Display semantic theme colors and contrast pairs.      | Build    | P3       |

### 13. Date, time, and scheduling

| Component         | Purpose                                   | Decision | Priority |
| ----------------- | ----------------------------------------- | -------- | -------- |
| `Clock`           | Live local or zoned time.                 | Build    | P2       |
| `Timer`           | Elapsed duration with pause and reset.    | Build    | P2       |
| `Countdown`       | Remaining duration with completion event. | Build    | P2       |
| `Calendar`        | Navigate and select dates.                | Research | P3       |
| `DateRangePicker` | Select a bounded date interval.           | Defer    | P3       |
| `Schedule`        | Ordered upcoming events.                  | Build    | P3       |
| `Gantt`           | Time-based task spans.                    | Defer    | P3       |

### 14. Application blocks

Build as examples first. Promote lower-level pieces only after reuse appears.

| Block                 | Components it validates                          |
| --------------------- | ------------------------------------------------ |
| `SystemMonitor`       | stats, sparklines, process table, gauges         |
| `ServiceDashboard`    | health, latency, logs, alerts, timelines         |
| `GitClient`           | file tree, status, commit list, diff viewer      |
| `TestRunner`          | tree, progress, failures, logs, command output   |
| `TaskDashboard`       | task progress, process output, notifications     |
| `DatabaseExplorer`    | tree, query editor, results table, inspector     |
| `HTTPInspector`       | request list, headers, body, timing bars         |
| `PackageExplorer`     | search, dependency tree, metadata, versions      |
| `FileManager`         | tree, list, preview, actions, dialogs            |
| `LogDashboard`        | filters, virtual log viewer, histogram, timeline |

## Runnable examples

Examples remain outside the published package and consume only public
component APIs.

| Example | Artifact | Purpose | Status |
| --- | --- | --- | --- |
| `component-gallery` | Pattern | Browse and lifecycle-test every component story. | Available |
| `dashboard` | Template | Compose display components into a service dashboard. | Available |
| `process-monitor` | Block | Demonstrate live updates, render batching, and cleanup. | Available |

Run interactively:

```sh
npm run example:gallery
npm run example:dashboard
npm run example:process-monitor
```

Run all lifecycle smoke tests:

```sh
npm run examples:smoke
```
| `KubernetesDashboard` | resource table, status, events, logs             |
| `QueueMonitor`        | rates, depth, workers, failures, retries         |
| `CI Dashboard`        | pipelines, jobs, duration, logs, artifacts       |
| `CommandCenter`       | command palette, shortcuts, task runner          |

## Recommended scope

### Release 0.1 — Display foundation

- `visibleWidth`
- `truncate`
- `escapeTags`
- `scaleValue`
- number and percent formatters
- `Text`
- `ProgressBar`
- `Sparkline`
- `MetricBars`
- `Stat`

This release proves rendering, width calculations, themes, packaging, and
updates without requiring complex focus behavior.

### Release 0.2 — Composition and states

- `Card`
- `Stack`
- `Divider`
- `KeyValue`
- `Badge`
- `Trend`
- `Spinner`
- `Alert`
- `EmptyState`
- `TaskProgress`

### Release 0.3 — Collections and live output

- shared selection primitive
- `List`
- `Table`
- `LogViewer`
- `Timeline`
- `JsonViewer`
- virtualization experiment

### Release 0.4 — Navigation and overlays

- shared keymap and focus-scope primitives
- `Tabs`
- `Menu`
- `HelpOverlay`
- `Overlay`
- `Dialog`
- `ConfirmDialog`
- `CommandPalette`

### Release 0.5 — Forms

- `Button`
- `FormField`
- `TextField`
- `SearchField`
- `Checkbox`
- `RadioGroup`
- `Select`
- `Form`

### Release 0.6 — Advanced data display

- `DataTable`
- `Tree`
- `DiffView`
- `LogExplorer`
- `CodeViewer`
- `StackTrace`

### Release 0.7 — Layout system

- `Viewport`
- `ScrollArea`
- `Grid`
- `SidebarLayout`
- `Collapsible`
- `Accordion`
- `AppShell`

### Release 0.8 — Visualization primitives

- `Legend`
- `Axis`
- `Thresholds`
- `Gauge`
- `ProgressStack`
- `Histogram`
- chart prototype evaluation

### Release 0.9 — Hardening

- Windows, macOS, and Linux compatibility;
- terminal capability matrix;
- mouse and keyboard integration tests;
- high-frequency update benchmarks;
- memory and listener leak tests;
- public API review;
- migration tooling;
- documentation site and component gallery.

### Release 1.0 — Stable core

- stable semantic versioning policy;
- stable component lifecycle contract;
- stable theme token contract;
- documented keyboard maps;
- runnable examples for every component;
- performance budgets;
- accessibility and fallback guidance;
- upgrade and deprecation policy.

## TDD strategy

Develop as vertical tracer bullets. Never write the complete test suite before
implementation.

```text
RED: one public behavior fails
  ↓
GREEN: minimum implementation passes
  ↓
REFACTOR: improve design while green
  ↓
next behavior
```

Test priority:

1. visible output through a public renderer;
2. bounds, scaling, truncation, and available width;
3. state updates through public methods;
4. real Blessed element integration;
5. keyboard and focus behavior;
6. ASCII, no-color, empty, invalid, and narrow states;
7. listener, timer, and process cleanup;
8. package-level ESM and CommonJS imports.

Avoid:

- testing private helpers directly when public behavior can prove them;
- mocking internal collaborators;
- asserting internal event call order;
- large snapshots as the primary contract;
- relying only on one terminal size;
- tests that pass despite broken visible output.

## First tracer bullet: ProgressBar

RED → GREEN cycles:

1. Render 50% at a fixed width.
2. Clamp values below `min` and above `max`.
3. Render label and formatted value.
4. Respect narrow inner width.
5. Update content through `setData`.
6. Use ASCII characters when Unicode is disabled.
7. Apply semantic theme tokens.
8. Destroy adapter-owned listeners.
9. Import built package from ESM and CommonJS.

Exit criteria:

- public renderer API is validated;
- Blessed adapter contract is validated;
- component handle decision is recorded;
- pattern can be reused by `MetricBars` and `Gauge`.

## Component admission criteria

A new component enters the package only when:

1. at least two realistic use cases exist;
2. it provides more than a renamed Blessed constructor;
3. its responsibilities cannot be composed clearly from existing exports;
4. keyboard and focus behavior can be specified;
5. narrow, empty, invalid, ASCII, and no-color states are understood;
6. lifecycle ownership is explicit;
7. a public-behavior test plan exists;
8. maintenance cost is proportionate to expected use.

Otherwise, keep it as a pattern, example, block, or external integration.

## Common contracts

Every component must document:

- accepted data;
- defaults;
- empty output;
- invalid input behavior;
- truncation and wrapping;
- resize behavior;
- Unicode and color fallbacks;
- controlled and uncontrolled state, if applicable;
- keyboard map;
- focus entry, movement, and restoration;
- emitted events;
- listener, timer, stream, and process ownership;
- `setData`, `setOptions`, or immutable recreation policy;
- destruction behavior;
- performance limits.

## Definition of Done

- Public API and exported types documented.
- Each behavior added through a RED → GREEN cycle.
- Tests use public renderers or component handles.
- Normal, empty, invalid, and narrow states covered.
- Unicode, ASCII, color, and no-color behavior covered.
- Keyboard map covered for interactive components.
- Focus restoration covered for overlays.
- No listeners, timers, streams, or processes survive `destroy()`.
- Runnable example included.
- ESM and CommonJS package imports verified.
- Packed npm contents inspected.
- Changelog entry generated by release workflow.

## Decisions still requiring prototypes

1. Return an extended Blessed element or `ComponentHandle`.
2. Represent pure output as strings, rows, cells, or a richer render model.
3. Automatic resize listeners or explicit resize/update calls.
4. One package or optional subpath exports for charts and media.
5. Mouse behavior enabled by default or opt-in.
6. Theme inheritance through explicit options or screen-attached context.
7. Virtualization API shared by lists, tables, trees, and logs.
8. Supported Blessed implementation: original package, maintained fork, or
   adapter compatibility layer.

Resolve decisions through small prototypes and public behavior tests, not
abstract API design alone.
