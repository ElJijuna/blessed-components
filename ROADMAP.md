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
- optional mouse interaction for interactive adapters;
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
- Enable Blessed mouse handling by default on interactive adapters where row or
  action targeting is meaningful, with opt-out through `box.mouse = false`.
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
| `collections`    | `AnsiViewer`, `DataTable`, `DiffView`, `GroupedList`, `HexViewer`, `List`, `LogExplorer`, `LogViewer`, `ProcessList`, `Table`, `Timeline`, `Tree`, `TreeTable`, `VirtualList`, `VirtualTable` |
| `data-display`   | `Badge`, `Code`, `KeyValue`, `Pill`, `Preformatted`, `Rating`, `Stat`, `Text` |
| `developer-tools` | `BuildStatus`, `CodeViewer`, `CommitList`, `CommandOutput`, `DependencyTree`, `DiffViewer`, `EnvironmentTable`, `EventLog`, `GitStatus`, `PerformancePanel`, `QueryResults`, `RequestInspector`, `ShortcutRecorder`, `StackTrace`, `TestResults` |
| `feedback`       | `NotificationCenter`, `ProgressBar`, `Skeleton`, `Spinner` |
| `visualization`  | `AreaChart`, `BarChart`, `BoxPlot`, `CandlestickChart`, `Donut`, `Gauge`, `Heatmap`, `Legend`, `LineChart`, `MetricBars`, `ScatterPlot`, `Sparkline`, `StackedBarChart`, `Thresholds`, `WaterfallChart` |
| `input`          | `Button`, `FilePicker`, `Form`            |
| `layout`         | `AspectRatio`, `Box`, `Card`, `Divider`, `Resizable`, `ScrollArea`, `SplitPane`, `Stack`, `Viewport` |
| `navigation`     | `Carousel`, `ContextMenu`                 |
| `overlays`       | `ConfirmDialog`, `Dialog`, `Popover`      |

Pure renderers own content and character overrides. Semantic color and style
tokens are applied by adapters, while terminal capability detection selects
safe defaults. This keeps core renderers deterministic and no-color friendly.

### Primitive implementation status

| Primitive     | Shared behavior                                             | Status    |
| ------------- | ----------------------------------------------------------- | --------- |
| [x] `Collection`  | Ordered identity, lookup, disabled items, looping navigation | Available |
| [x] `Selection`   | Single and multiple selection with deterministic ordering   | Available |
| [x] `FocusScope`  | Focus capture, trapping, traversal, and restoration          | Available |
| [x] `Viewport`    | Two-dimensional bounds, resizing, and visibility             | Available |
| [x] `ScrollArea`  | Line/page movement and scrollbar metrics                     | Available |
| [x] `Overlay`     | Layer stack, modal blocking, Escape, and focus return        | Available |

## Component opportunity analysis

Legend:

- `[x]`: implemented and available through the public API.
- `[ ]`: not implemented yet (or intentionally excluded from the package).
- **Available**: implemented, documented, and published through public exports.
- **Build**: strong fit and clear differentiation.
- **Adapt**: wrap or compose existing Blessed behavior with better contracts.
- **Research**: valuable, but API or terminal behavior needs validation.
- **Defer**: expensive, niche, or already served well elsewhere.

### 1. Foundation utilities

These unlock almost every visual component and should be built first.

| Utility              | Purpose                                                   | Decision | Priority |
| -------------------- | --------------------------------------------------------- | -------- | -------- |
| [x] `visibleWidth`       | Measure text while ignoring Blessed tags and ANSI codes.  | Available | P0       |
| [x] `truncate`           | End, middle, and start truncation by terminal cell width. | Available | P0       |
| [x] `wrapText`           | Cell-aware wrapping with indentation.                     | Available | P0       |
| [x] `escapeTags`         | Prevent dynamic text from becoming Blessed markup.        | Available | P0       |
| [x] `scaleValue`         | Map numeric domains into cell or glyph ranges.            | Available | P0       |
| [x] `clamp`              | Bound values safely.                                      | Available | P0       |
| [x] `sampleSeries`       | Downsample time-series data to available width.           | Available | P0       |
| [x] `formatNumber`       | Locale-aware compact and full numbers.                    | Available | P0       |
| [x] `formatPercent`      | Consistent percentages and precision.                     | Available | P0       |
| [x] `formatBytes`        | IEC/SI byte formatting.                                   | Available | P1       |
| [x] `formatDuration`     | Human and clock duration formats.                         | Available | P1       |
| [x] `formatRate`         | Values per second or interval.                            | Available | P1       |
| [x] `formatDateTime`     | Terminal-friendly timestamps.                             | Available | P1       |
| [x] `detectCapabilities` | Unicode, color depth, mouse, and terminal features.       | Available | P1       |
| [x] `createKeymap`       | Normalized key bindings with help metadata.               | Available | P1       |
| [x] `createTheme`        | Merge semantic tokens and component overrides.            | Available | P1       |
| [x] `renderToString`     | Render pure models for tests and static terminal output.  | Available | P1       |
| [x] `diffRows`           | Identify changed rows for high-frequency updates.         | Available | P2       |

### 2. Layout and composition

Blessed has positioning and a basic layout element. Opportunity exists in
predictable, typed composition and responsive rules.

| Component       | Purpose                                                 | Decision | Priority |
| --------------- | ------------------------------------------------------- | -------- | -------- |
| [x] `Box`           | Typed base container with theme defaults.               | Available | P1       |
| [x] `Card`          | Root, header, title, description, body, footer.         | Available | P1       |
| [x] `Stack`         | Vertical or horizontal flow with gaps.                  | Available | P1       |
| [x] `Cluster`       | Wrapping inline group for badges and actions.           | Available | P2       |
| [x] `Grid`          | Responsive row/column placement with spans.             | Available | P2       |
| [x] `SplitPane`     | Resizable horizontal or vertical regions.               | Available | P2       |
| [x] `SidebarLayout` | Sidebar plus main content with collapse rules.          | Available | P2       |
| [x] `Center`        | Center one child in available space.                    | Available | P2       |
| [x] `Spacer`        | Flexible or fixed empty space.                          | Available | P2       |
| [x] `Divider`       | Horizontal or vertical separator with optional label.   | Available | P1       |
| [x] `AspectRatio`   | Preserve cell-aware proportions.                        | Available | P3       |
| [x] `Viewport`      | Visual wrapper around the available headless primitive. | Available | P1       |
| [x] `ScrollArea`    | Styled Blessed wrapper around the headless primitive.   | Available | P1       |
| [x] `Resizable`     | Keyboard/mouse resize behavior for one region.          | Available | P3       |
| [x] `Collapsible`   | Show or hide a region while preserving state.           | Available | P2       |
| [x] `Accordion`     | Multiple collapsible sections with keyboard navigation. | Available | P2       |
| [x] `Page`          | Full-screen region with title and action slots.         | Available | P2       |
| [x] `AppShell`      | Header, footer, sidebar, content, and overlay layers.   | Available | P2       |

### 3. Typography and small data display

High value, low complexity, excellent early components.

| Component         | Purpose                                               | Decision | Priority |
| ----------------- | ----------------------------------------------------- | -------- | -------- |
| [x] `Text`            | Safe themed text with truncation and wrapping.        | Available | P0       |
| [x] `Heading`         | Hierarchical terminal heading styles.                 | Available | P1       |
| [x] `Label`           | Stable labels for controls and values.                | Available | P1       |
| [x] `MutedText`       | Secondary information using semantic theme tokens.    | Available | P1       |
| [x] `Code`            | Inline code with safe escaping.                       | Available | P2       |
| [x] `Preformatted`    | Preserve whitespace with horizontal scroll policy.    | Available | P2       |
| [x] `Stat`            | Label, value, unit, trend, and description.           | Available | P0       |
| [x] `KeyValue`        | Aligned label/value rows.                             | Available | P1       |
| [x] `DescriptionList` | Responsive term/description groups.                   | Available | P2       |
| [x] `Badge`           | Compact semantic status.                              | Available | P1       |
| [x] `Tag`             | Removable or static categorization token.             | Available | P2       |
| [x] `Pill`            | Rounded-character compact label where supported.      | Available | P3       |
| [x] `Timestamp`       | Formatted absolute or relative time.                  | Available | P2       |
| [x] `Trend`           | Up/down/flat indicator with accessible text fallback. | Available | P1       |
| [x] `Rating`          | Discrete score using symbols and text fallback.       | Available | P3       |
| [x] `Kbd`             | Display keyboard shortcuts consistently.              | Available | P1       |
| [x] `Breadcrumb`      | Current location path with truncation.                | Available | P2       |

### 4. Progress, status, and feedback

These components share bounded values, semantic tones, and live updates.

| Component            | Purpose                                                 | Decision | Priority |
| -------------------- | ------------------------------------------------------- | -------- | -------- |
| [x] `ProgressBar`        | One determinate horizontal progress bar.                | Available | P0       |
| [x] `ProgressStack`      | Segmented progress across categories.                   | Available | P1       |
| [x] `ProgressList`       | Multiple labeled progress rows.                         | Available | P1       |
| [x] `Spinner`            | Indeterminate activity indicator.                       | Available | P1       |
| [x] `Status`             | State icon, label, and optional detail.                 | Available | P1       |
| [x] `Alert`              | Inline information, success, warning, or error message. | Available | P1       |
| [x] `Banner`             | Full-width persistent alert region for app-level state. | Available | P3       |
| [x] `Callout`            | Framed explanatory content.                             | Available | P2       |
| [x] `Toast`              | Timed transient notification stack.                     | Available | P2       |
| [x] `NotificationCenter` | Persistent notification list and unread state.          | Available | P3       |
| [x] `Skeleton`           | Placeholder rows while content loads.                   | Available | P2       |
| [x] `EmptyState`         | Empty result message with optional action.              | Available | P1       |
| [x] `ErrorState`         | Error details, cause, and retry action.                 | Available | P1       |
| [x] `LoadingOverlay`     | Block interaction while work runs.                      | Available | P2       |
| [x] `TaskProgress`       | Multi-step task status with current activity.           | Available | P1       |
| [x] `StepIndicator`      | Completed, active, and pending steps.                   | Available | P1       |
| [x] `ConnectionStatus`   | Online, reconnecting, offline, latency.                 | Available | P2       |
| [x] `HealthIndicator`    | Service health summary with reasons.                    | Available | P2       |

### 5. Collections and structured data

This family should share selection, focus, sorting, filtering, scrolling, and
virtualization primitives.

| Component      | Purpose                                                    | Decision    | Priority |
| -------------- | ---------------------------------------------------------- | ----------- | -------- |
| [x] `List`         | Typed items, selection, empty state, and bounded rendering. | Available   | P1       |
| [x] `VirtualList`  | Render large lists using visible rows only.                | Available   | P2       |
| [x] `GroupedList`  | Sections with sticky or repeated headings.                 | Available   | P2       |
| [x] `Table`        | Typed columns, alignment, truncation, and selection.       | Available   | P1       |
| [x] `DataTable`    | Sort, filter, paginate, resize, and column visibility.     | Available   | P2       |
| [x] `VirtualTable` | Large row sets with bounded rendering.                     | Available   | P2       |
| [x] `Tree`         | Expandable hierarchical navigation.                        | Available   | P2       |
| [x] `TreeTable`    | Hierarchical rows plus columns.                            | Available   | P3       |
| [x] `Timeline`     | Ordered events with time and status.                       | Available   | P2       |
| [x] `ActivityFeed` | Live events with grouping and retention.                   | Available   | P2       |
| [x] `DiffView`     | Side-by-side or unified text differences.                  | Available   | P2       |
| [x] `FileTree`     | File-specific tree with icons and git state.               | Available   | P2       |
| [x] `ProcessList`  | PID, CPU, memory, status, and actions.                     | Available   | P3       |
| [x] `LogViewer`    | Streaming logs with retention and pause.                   | Available   | P1       |
| [x] `LogExplorer`  | Search, filters, levels, timestamps, and follow mode.      | Available   | P2       |
| [x] `JsonViewer`   | Expandable structured JSON values.                         | Available   | P2       |
| [x] `Inspector`    | Generic nested object inspection.                          | Available   | P2       |
| [x] `HexViewer`    | Byte offsets, hex, and text representation.                | Available   | P3       |
| [x] `AnsiViewer`   | Safely display ANSI-formatted output.                      | Available   | P3       |

### 6. Charts and numeric visualization

Charts are useful but expensive. Build shared axes, domains, legends, and
sampling first. Avoid duplicating `blessed-contrib` without a measurable API,
quality, or maintenance advantage.

| Component          | Purpose                                             | Decision     | Priority |
| ------------------ | --------------------------------------------------- | ------------ | -------- |
| [x] `Sparkline`        | Compact single-series trend.                        | Available    | P0       |
| [x] `MultiSparkline`   | Aligned compact series with labels.                 | Available    | P1       |
| [x] `MetricBars`       | Labeled horizontal metric bars.                     | Available    | P0       |
| [x] `Gauge`            | One bounded value with label and thresholds.        | Available    | P1       |
| [x] `StackedGauge`     | Composition of portions in one track.               | Available    | P2       |
| [x] `BulletChart`      | Actual value against target and qualitative ranges. | Available    | P2       |
| [x] `BarChart`         | Categorical value comparison.                       | Available    | P2       |
| [x] `StackedBarChart`  | Category composition over multiple series.          | Available    | P3       |
| [x] `LineChart`        | One or more series over an axis.                    | Available    | P2       |
| [x] `AreaChart`        | Filled time-series trend.                           | Available    | P3       |
| [x] `Histogram`        | Numeric distribution by bins.                       | Available    | P2       |
| [x] `Heatmap`          | Dense matrix of intensity values.                   | Available    | P3       |
| [x] `CalendarHeatmap`  | Activity intensity by date.                         | Available    | P3       |
| [x] `ScatterPlot`      | Relationship between two numeric values.            | Available    | P3       |
| [x] `BoxPlot`          | Statistical distribution summary.                   | Available    | P3       |
| [x] `Donut`            | Part-to-whole radial display.                       | Available    | P3       |
| [ ] `PieChart`         | Part-to-whole radial display.                       | Do not build | —        |
| [x] `CandlestickChart` | Open/high/low/close financial series.               | Available    | P3       |
| [x] `WaterfallChart`   | Sequential positive and negative contributions.     | Available    | P3       |
| [x] `Legend`           | Shared series labels and glyphs.                    | Available    | P1       |
| [x] `Axis`             | Shared numeric/category axis renderer.              | Available    | P2       |
| [x] `Thresholds`       | Shared warning and critical ranges.                 | Available    | P1       |

`PieChart` is a non-goal: terminal cell aspect ratios and low resolution make
angle and area comparison poor. Prefer `MetricBars`, `ProgressStack`, or
`Donut` only when visual familiarity outweighs precision.

### 7. Navigation

Navigation components need a shared focus model and documented keyboard maps.

| Component        | Purpose                                        | Decision | Priority |
| ---------------- | ---------------------------------------------- | -------- | -------- |
| [x] `Tabs`           | Switch between labeled views.                  | Available | P1       |
| [x] `TabList`        | Compound tab trigger collection.               | Available | P1       |
| [x] `Menu`           | Vertical action navigation.                    | Available | P1       |
| [x] `MenuBar`        | Top-level horizontal menus.                    | Available | P2       |
| [x] `DropdownMenu`   | Top-level menus with open action dropdowns.    | Available | P2       |
| [x] `ContextMenu`    | Mouse or keyboard anchored action menu.        | Available | P3       |
| [x] `NavigationList` | Route or view navigation with active state.    | Available | P2       |
| [x] `Pagination`     | Move through bounded result pages.             | Available | P2       |
| [x] `Pager`          | Previous/next navigation for views or records. | Available | P2       |
| [x] `Carousel`       | Manual or timed view rotation.                 | Available | P3       |
| [x] `CommandPalette` | Searchable command execution.                  | Available | P2       |
| [x] `QuickSwitcher`  | Search and switch resources or views.          | Available | P2       |
| [x] `HelpOverlay`    | Searchable keyboard shortcut reference.        | Available | P1       |

### 8. Inputs and forms

Blessed already has form elements. Value comes from typed values, validation,
consistent state, composition, and cleanup.

| Component         | Purpose                                                | Decision | Priority |
| ----------------- | ------------------------------------------------------ | -------- | -------- |
| [x] `Button`          | Typed action with tone and disabled states.            | Available | P1       |
| [x] `IconButton`      | Compact action with required text description.         | Available | P2       |
| [x] `TextField`       | Single-line text with label, hint, and error.          | Available | P1       |
| [x] `PasswordField`   | Masked input with reveal behavior.                     | Available | P2       |
| [x] `TextArea`        | Multiline text with validation and counters.           | Available | P2       |
| [x] `NumberField`     | Numeric input with parsing, bounds, and step.          | Available | P2       |
| [x] `SearchField`     | Query input with clear and submit actions.             | Available | P1       |
| [x] `Checkbox`        | Boolean value with indeterminate state.                | Available | P1       |
| [x] `RadioGroup`      | One value from visible choices.                        | Available | P1       |
| [x] `Switch`          | Immediate boolean setting.                             | Available | P2       |
| [x] `Select`          | One value from a popup or inline list.                 | Available | P1       |
| [x] `MultiSelect`     | Multiple values with filtering.                        | Available | P2       |
| [x] `Combobox`        | Searchable input plus suggestions.                     | Available | P2       |
| [x] `Autocomplete`    | Suggest completions while typing.                      | Available | P2       |
| [x] `DateInput`       | Parse and validate a date string.                      | Available | P3       |
| [x] `TimeInput`       | Parse and validate time.                               | Available | P3       |
| [x] `KeybindingInput` | Capture and display shortcut combinations.             | Available | P3       |
| [x] `FilePicker`      | Navigate and select files or directories.              | Available | P2       |
| [x] `FormField`       | Label, control, hint, required, and error composition. | Available | P1       |
| [x] `Form`            | Submission, validation, reset, and field registry.     | Available | P1       |

### 9. Overlays and transient UI

Terminal overlays require layering, focus capture, focus restoration, and
global key cleanup.

| Component       | Purpose                                         | Decision | Priority |
| --------------- | ----------------------------------------------- | -------- | -------- |
| [x] `Overlay`       | Visual screen layer over the available stack primitive. | Available | P1       |
| [x] `Dialog`        | Modal content with focus capture and restore.   | Available | P1       |
| [x] `ConfirmDialog` | Confirm or cancel a consequential action.       | Available | P1       |
| [x] `PromptDialog`  | Request one value in a modal flow.              | Available | P2       |
| [x] `Drawer`        | Edge-attached temporary panel.                  | Available | P2       |
| [x] `Popover`       | Anchored temporary content.                     | Available | P3       |
| [x] `Tooltip`       | Delayed contextual help.                        | Available | P3       |
| [x] `ToastViewport` | Position and manage toast notifications.        | Available | P2       |
| [x] `Spotlight`     | Full-screen searchable action/resource overlay. | Available | P2       |

### 10. Developer-tool components

Strong opportunity: terminal applications are frequently developer tools.
These components can differentiate the package from generic dashboard
libraries.

| Component          | Purpose                                             | Decision    | Priority |
| ------------------ | --------------------------------------------------- | ----------- | -------- |
| [x] `CodeViewer`       | Syntax-highlighted, scrollable source.              | Available   | P2       |
| [x] `DiffViewer`       | Unified or split patch rendering.                   | Available   | P2       |
| [x] `StackTrace`       | Parse and navigate stack frames.                    | Available   | P2       |
| [x] `TestResults`      | Suites, tests, failures, duration, and retry state. | Available   | P2       |
| [x] `BuildStatus`      | Build phases, duration, logs, and outcome.          | Available   | P2       |
| [x] `GitStatus`        | Branch, staged, modified, untracked, conflicts.     | Available   | P2       |
| [x] `CommitList`       | Commit summary, author, date, and refs.             | Available   | P3       |
| [x] `DependencyTree`   | Package dependency hierarchy and problems.          | Available   | P3       |
| [x] `RequestInspector` | HTTP request/response headers and body.             | Available   | P3       |
| [x] `QueryResults`     | Database result table and execution metadata.       | Available   | P3       |
| [x] `EnvironmentTable` | Masked environment variable inspection.             | Available   | P3       |
| [x] `ShortcutRecorder` | Inspect keypress names emitted by terminal.         | Available   | P3       |
| [x] `EventLog`         | Structured event stream for debugging TUI behavior. | Available   | P2       |
| [x] `PerformancePanel` | FPS, render time, memory, and event-loop delay.     | Available   | P3       |

### 11. Terminal and process components

High power, high lifecycle and security cost.

| Component       | Purpose                                         | Decision    | Priority |
| --------------- | ----------------------------------------------- | ----------- | -------- |
| [x] `TerminalPane`  | Display a scrollable terminal session pane.     | Available   | P3       |
| [x] `ProcessRunner` | Run command, stream output, expose exit state.  | Available   | P3       |
| [x] `ProcessTable`  | Monitor multiple child processes.               | Available   | P3       |
| [x] `CommandOutput` | Read-only stdout/stderr viewer with status.     | Available   | P2       |
| [x] `TaskRunner`    | Execute named tasks with logs and cancellation. | Available   | P3       |
| [x] `REPL`          | Prompt, history, evaluation, and results.       | Available   | P3       |
| [x] `ShellHistory`  | Search and select previous commands.            | Available   | P3       |

Process APIs must never execute shell strings implicitly. Commands, arguments,
environment, cancellation, and signal behavior require explicit contracts.

### 12. Content and media

Useful, but dependency-heavy features should remain optional entry points.

| Component        | Purpose                                                | Decision | Priority |
| ---------------- | ------------------------------------------------------ | -------- | -------- |
| [x] `MarkdownViewer` | Render Markdown into terminal-safe content.            | Available | P3       |
| [x] `RichText`       | Styled spans, links, and selectable text.              | Available | P3       |
| [x] `Link`           | Visible URL plus optional terminal hyperlink sequence. | Available | P2       |
| [x] `Image`          | Capability-aware terminal image or text fallback.      | Available | P3       |
| [x] `AsciiArt`       | Render static art with alignment and cropping.         | Available | P3       |
| [x] `BigText`        | Large glyph text through Blessed.                      | Available | P3       |
| [x] `QRCode`         | Render QR codes using terminal cells.                  | Available | P3       |
| [x] `ColorSwatch`    | Show terminal color and numeric representation.        | Available | P3       |
| [x] `Palette`        | Display semantic theme colors and contrast pairs.      | Available | P3       |

### 13. Date, time, and scheduling

| Component         | Purpose                                   | Decision | Priority |
| ----------------- | ----------------------------------------- | -------- | -------- |
| [x] `Clock`           | Live local or zoned time.                 | Available | P2       |
| [x] `Timer`           | Elapsed duration with pause and reset.    | Available | P2       |
| [x] `Countdown`       | Remaining duration with completion event. | Available | P2       |
| [x] `Calendar`        | Navigate and select dates.                | Available | P3       |
| [x] `DateRangePicker` | Select a bounded date interval.           | Available | P3       |
| [x] `Schedule`        | Ordered upcoming events.                  | Available | P3       |
| [x] `Gantt`           | Time-based task spans.                    | Available | P3       |

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
| [x] `component-gallery` | Pattern | Browse and lifecycle-test every component story in an interactive workbench. | Available |
| [x] `dashboard` | Template | Operate a service control plane with navigation, health, SLO, traffic, and deploy state. | Available |
| [x] `process-monitor` | Block | Monitor Node and host resources with bounded live histories and batched rendering. | Available |
| [x] `system-inspector` | Template | Inspect real host memory, load, and top-process snapshots. | Available |

Run interactively:

```sh
npm run example:gallery
npm run example:dashboard
npm run example:process-monitor
npm run example:system-inspector
```

Run all lifecycle smoke tests:

```sh
npm run examples:smoke
```

## P1 hardening status

These items raise the package from component collection toward application
library quality.

| Area | Status | Artifact |
| --- | --- | --- |
| Theme tokens | Available | Shared Blessed styling resolves component colors and active variants; `Box` consumes padding/borders, while `Stack`, `Cluster`, and `Grid` consume spacing defaults. |
| Capability scenarios | Partial | `createCapabilityMatrix` covers deterministic simulated dumb, no-color, Windows ASCII fallback, 256-color, and truecolor inputs; it is not native OS coverage. |
| Native platform matrix | Planned | CI still needs real Linux, macOS, and Windows jobs with terminal-sensitive integration tests. |
| Interaction tests | Available | Public tests cover event clearing, modified key chords, focus fallback, and focus-trap behavior through Dialog integration. |
| Listener/timer cleanup | Partial | Spinner timer cleanup and Toast resize-listener cleanup are covered; systematic memory, listener, stream, and process leak checks remain. |
| Renderer benchmarks | Partial | `npm run benchmark` measures large tables, log windows, line-chart sampling, and bar-chart rendering, but stored baselines and CI budgets remain. |
| Navigable component docs | Available | `npm run docs:index` generates `docs/component-index.md` with adapter/test/story/doc maturity per component. |

## P2 packaging and starter status

| Area | Status | Artifact |
| --- | --- | --- |
| Generated package config | Available | `npm run package:generate` derives `package.json` exports and `tsup.config.ts` entries from source layout. |
| Package drift check | Available | `npm run package:check` blocks stale exports or build entries in validation. |
| Starter CLI | Available | `npx blessed-components create my-app` scaffolds a typed Blessed application starter. |
| Starter template | Available | `templates/starter` includes a typed app, package scripts, and local README. |
| Library policy | Available | `docs/policies.md` documents stability, deprecation, terminal fallback, performance, and packaging rules. |

### Future application blocks

| Block | Components it validates |
| --- | --- |
| `KubernetesDashboard` | resource table, status, events, logs |
| `QueueMonitor` | rates, depth, workers, failures, retries |
| `CI Dashboard` | pipelines, jobs, duration, logs, artifacts |
| `CommandCenter` | command palette, shortcuts, task runner |

## New component backlog

The current package already covers the original foundation. New components
should now prioritize application ergonomics: command surfaces, filtering,
status context, inspector workflows, and reusable panels that appear across
real TUI applications.

### Next application components

These are the strongest candidates because they compose existing primitives
without duplicating charts, tables, or low-level Blessed widgets.

| Component | Purpose | Decision | Priority |
| --- | --- | --- | --- |
| [x] `ActionBar` | Compact row of actions with labels, shortcuts, disabled state, and overflow handling. | Available | P1 |
| [x] `StatusBar` | Persistent application footer for mode, selection, connection, task, and shortcut hints. | Available | P1 |
| [x] `FilterBar` | Render active filters, query state, clear/reset actions, and compact result metadata. | Available | P1 |
| [x] `Toolbar` | Horizontal command group for icon-like terminal actions, separators, and keyboard hints. | Available | P2 |
| [x] `CommandLog` | Structured history of executed actions with status, timestamps, and retry metadata. | Available | P2 |
| [x] `JobQueue` | Queue of background jobs with progress, cancellation, retry, and terminal-safe summaries. | Available | P2 |
| [x] `KeymapHelp` | Render registered keymaps grouped by scope with conflicts and disabled commands. | Available | P2 |
| [x] `SelectionSummary` | Summarize selected rows/items and expose bulk action affordances. | Available | P2 |
| [x] `InspectorPanel` | Opinionated panel combining heading, metadata, tabs, JSON, logs, and actions. | Available | P2 |
| [x] `DetailsPanel` | Responsive master-detail side panel for selected collection items. | Available | P2 |

### Extended candidate list

These should enter only after the admission criteria are satisfied. Many may
start as examples or documented patterns before becoming package components.

| Category | Component | Purpose | Decision | Priority |
| --- | --- | --- | --- | --- |
| app-shell | [x] `HeaderBar` | Application title, environment, active workspace, and primary status. | Available | P2 |
| app-shell | [x] `FooterBar` | Persistent footer for shortcuts, messages, and transient app state. | Available | P2 |
| app-shell | [x] `WorkspaceSwitcher` | Switch between named projects, clusters, databases, or sessions. | Available | P2 |
| app-shell | [x] `ModeIndicator` | Display current mode such as normal, insert, command, or visual. | Available | P3 |
| app-shell | [x] `CommandCenter` | Opinionated composition of palette, recent commands, help, and actions. | Available | P3 |
| app-shell | [x] `DashboardGrid` | Higher-level responsive grid for metric panels and live widgets. | Available | P3 |
| navigation | [x] `BreadcrumbBar` | Breadcrumb plus sibling navigation and contextual actions. | Available | P3 |
| navigation | [x] `StepperForm` | Multi-step form flow with validation and navigation controls. | Available | P2 |
| navigation | [x] `Wizard` | Modal or page-level guided flow with next/back/cancel contracts. | Available | P2 |
| navigation | [x] `RouteTabs` | Tabs bound to route ids, dirty state, and close behavior. | Available | P3 |
| navigation | [ ] `HistoryList` | Back/forward stack viewer for navigable terminal apps. | Research | P3 |
| navigation | [ ] `RecentItems` | Bounded recently opened resources with fuzzy labels. | Build | P3 |
| input | [x] `SearchBar` | Search field plus scope, submit, clear, and result count. | Available | P2 |
| input | [ ] `FilterMenu` | Menu for composing boolean, enum, text, and range filters. | Build | P2 |
| input | [ ] `SortMenu` | Sort fields and directions for tables and lists. | Build | P3 |
| input | [ ] `ColumnPicker` | Toggle table column visibility and ordering. | Build | P3 |
| input | [ ] `RangeInput` | Bounded min/max numeric pair with validation. | Build | P3 |
| input | [ ] `TokenInput` | Enter, remove, and navigate compact tokens. | Research | P3 |
| input | [ ] `TagInput` | Specialization of token input for labels and categorization. | Research | P3 |
| input | [x] `CommandInput` | Prompt-style command entry with suggestions and history. | Available | P2 |
| data-display | [ ] `MetadataPanel` | Dense key-value sections with badges, links, and timestamps. | Build | P2 |
| data-display | [ ] `ResourceHeader` | Name, type, status, tags, timestamps, and primary actions. | Build | P2 |
| data-display | [ ] `SummaryStrip` | Compact sequence of stats or status chips. | Build | P2 |
| data-display | [ ] `PropertyGrid` | Editable or read-only property list with grouped fields. | Research | P3 |
| data-display | [ ] `ComparePanel` | Side-by-side comparison of structured metadata. | Research | P3 |
| data-display | [ ] `VersionBadge` | Package/image/runtime version with channel and freshness state. | Research | P3 |
| feedback | [ ] `InlineProgress` | Progress text intended to fit inside action bars and table rows. | Build | P2 |
| feedback | [ ] `OperationStatus` | One operation's lifecycle: queued, running, succeeded, failed, retried. | Build | P2 |
| feedback | [ ] `ErrorList` | Multiple validation or runtime errors with focusable locations. | Build | P2 |
| feedback | [ ] `ValidationSummary` | Form-level errors grouped by field and severity. | Build | P2 |
| feedback | [x] `Banner` | Full-width persistent alert region for app-level state. | Available | P3 |
| feedback | [ ] `SyncStatus` | Last sync, dirty state, conflicts, and retry affordance. | Research | P3 |
| collections | [ ] `ResourceList` | Opinionated list for named resources with status, tags, and actions. | Pattern first | P2 |
| collections | [ ] `CommandList` | Action list with shortcuts, grouping, disabled reasons, and search text. | Build | P2 |
| collections | [ ] `IssueList` | Issue/task rows with priority, assignee, labels, and state. | Pattern first | P3 |
| collections | [ ] `FileList` | Flat file list with size, modified date, git state, and selection. | Build | P2 |
| collections | [ ] `KeyValueTable` | Table optimized for configuration and environment inspection. | Research | P3 |
| collections | [ ] `AuditTrail` | Chronological actor/action feed with filters and retention. | Build | P3 |
| developer-tools | [ ] `DiagnosticsPanel` | Problems, warnings, logs, and suggested actions in one view. | Build | P2 |
| developer-tools | [ ] `TraceViewer` | Structured span/tree rendering for traces and timings. | Research | P3 |
| developer-tools | [ ] `ProfilerPanel` | Render sampled timings, hotspots, and memory counters. | Research | P3 |
| developer-tools | [ ] `PackageSummary` | Package metadata, scripts, dependency health, and versions. | Pattern first | P3 |
| developer-tools | [ ] `PullRequestSummary` | PR metadata, checks, files, reviews, and mergeability. | Pattern first | P3 |
| terminal | [ ] `TaskList` | Select and run defined tasks with status and shortcuts. | Build | P2 |
| terminal | [ ] `SessionTabs` | Multiple terminal/process sessions with status and close behavior. | Research | P3 |
| terminal | [ ] `OutputSearch` | Search controls and match navigation for terminal output panes. | Build | P2 |
| terminal | [ ] `ProcessSummary` | Compact process group health, resource use, and exit status. | Build | P3 |
| overlays | [ ] `Sheet` | Modal bottom or side sheet optimized for forms and actions. | Research | P3 |
| overlays | [ ] `ActionSheet` | Compact modal action chooser for contextual commands. | Build | P2 |
| overlays | [ ] `NotificationToast` | Opinionated transient notification with action and timeout controls. | Research | P3 |
| overlays | [ ] `QuickOpen` | Resource opener combining recent items, search, and grouped results. | Build | P2 |

### Completed tracer bullet: ActionBar

`ActionBar` validates the new direction without requiring new infrastructure.

Initial scope:

1. Pure renderer for ordered actions with label, shortcut, disabled reason,
   tone, selected index, separators, and width-aware overflow.
2. Blessed adapter with keyboard navigation, Enter/Space activation, optional
   mouse activation, disabled-state protection, and lifecycle cleanup.
3. Public tests for width, truncation, disabled actions, overflow, keyboard
   labels, ASCII/no-color output, and activation callbacks.
4. Integration test proving focus, key handling, mouse opt-out, `setData`, and
   `destroy`.
5. Component gallery story showing normal, dense, overflow, and disabled
   states.

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
- `TabList`
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
