import blessed from 'blessed';

import {
  accordion,
  activityFeed,
  alert,
  appShell,
  asciiArt,
  autocomplete,
  axis,
  badge,
  box,
  bulletChart,
  button,
  calendarHeatmap,
  cardBody,
  cardDescription,
  cardFooter,
  cardHeader,
  cardRoot,
  cardTitle,
  center,
  checkbox,
  clock,
  cluster,
  collapsible,
  colorSwatch,
  combobox,
  commandPalette,
  dataTable,
  dialogBody,
  dialogContent,
  dialogDescription,
  dialogFooter,
  dialogRoot,
  dialogTitle,
  diffView,
  divider,
  drawerBody,
  drawerContent,
  drawerFooter,
  drawerHeader,
  drawerRoot,
  dropdownMenu,
  emptyState,
  errorState,
  fileTree,
  formField,
  gauge,
  grid,
  groupedList,
  heading,
  helpOverlay,
  histogram,
  iconButton,
  inspector,
  jsonViewer,
  kbd,
  keybindingInput,
  keyValue,
  label,
  legend,
  link,
  list,
  loadingOverlay,
  logExplorer,
  menu,
  menuBar,
  metricBars,
  multiSelect,
  multiSparkline,
  mutedText,
  navigationList,
  numberField,
  overlay,
  page,
  pager,
  pagination,
  palette,
  passwordField,
  progressBar,
  progressList,
  progressStack,
  quickSwitcher,
  radioGroup,
  renderAnsiViewer,
  renderAreaChart,
  renderAspectRatio,
  renderBarChart,
  renderBigText,
  renderBoxPlot,
  renderBuildStatus,
  renderCalendar,
  renderCandlestickChart,
  renderCarousel,
  renderCodeViewer,
  renderCommandOutput,
  renderCommitList,
  renderContextMenu,
  renderCountdown,
  renderDateInput,
  renderDateRangePicker,
  renderDependencyTree,
  renderDiffViewer,
  renderDonut,
  renderEnvironmentTable,
  renderEventLog,
  renderFilePicker,
  renderGantt,
  renderGitStatus,
  renderHeatmap,
  renderHexViewer,
  renderImage,
  renderLineChart,
  renderMarkdownViewer,
  renderNotificationCenter,
  renderPerformancePanel,
  renderPill,
  renderPopover,
  renderProcessList,
  renderProcessRunner,
  renderProcessTable,
  renderPromptDialog,
  renderQrCode,
  renderQueryResults,
  renderRating,
  renderRepl,
  renderRequestInspector,
  renderResizable,
  renderRichText,
  renderScatterPlot,
  renderSchedule,
  renderShellHistory,
  renderShortcutRecorder,
  renderSkeleton,
  renderSplitPane,
  renderStackedBarChart,
  renderStackTrace,
  renderTaskRunner,
  renderTestResults,
  renderTimeInput,
  renderToastViewport,
  renderTooltip,
  renderTreeTable,
  renderVirtualTable,
  renderWaterfallChart,
  scrollArea,
  searchField,
  select,
  sidebarLayout,
  spacer,
  sparkline,
  spinner,
  spotlight,
  stack,
  stackedGauge,
  stat,
  status,
  stepIndicator,
  switchControl,
  tabList,
  table,
  tabs,
  taskProgress,
  terminalPane,
  text,
  textArea,
  textField,
  thresholds,
  timer,
  toast,
  tree,
  trend,
  viewport,
} from '@/index.js';

import { defineStory, type PreviewStory } from './story.js';

interface RenderedTextStoryOptions {
  content: string;
  height: number;
  label: string;
  left?: number;
  top?: number;
  width: number;
}

function renderedTextStory(
  parent: blessed.Widgets.Node,
  { content, height, label, left = 3, top = 1, width }: RenderedTextStoryOptions,
) {
  return blessed.box({
    border: 'line',
    content,
    height,
    label: ` ${label} `,
    left,
    padding: { left: 1, right: 1 },
    parent,
    tags: false,
    top,
    width,
  });
}

export const stories: readonly PreviewStory[] = [
  defineStory({
    id: 'alert/semantic-message',
    title: 'Alert / Semantic Message',
    description: 'Wrapped semantic message with tone marker and themed border.',
    mount(parent) {
      const warning = alert({
        box: {
          border: 'line',
          height: 5,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 46,
        },
        data: {
          description: 'Retry deployment after upstream health checks recover.',
          title: 'Deploy delayed',
          tone: 'warning',
        },
        parent,
      });

      return warning;
    },
  }),
  defineStory({
    id: 'toast/deploy-stack',
    title: 'Toast / Deploy Stack',
    description: 'Transient notification stack with semantic markers.',
    mount(parent) {
      return toast({
        box: {
          border: 'line',
          height: 9,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 42,
        },
        data: {
          borderTone: 'primary',
          gap: 1,
          toasts: [
            {
              description: 'Production API promoted to stable.',
              id: 'deploy-complete',
              title: 'Deploy complete',
              tone: 'success',
            },
            {
              description: 'Queue workers will restart after drain.',
              id: 'workers',
              title: 'Worker rollout pending',
              tone: 'warning',
            },
          ],
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'loading-overlay/deploying',
    title: 'LoadingOverlay / Deploying',
    description: 'Modal loading layer with spinner content.',
    mount(parent) {
      return loadingOverlay({
        box: {
          border: 'line',
          height: 9,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 44,
        },
        data: {
          autoStart: false,
          borderTone: 'primary',
          defaultOpen: true,
          description: 'Waiting for production health checks.',
          id: 'gallery-loading',
          label: 'Deploying',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'empty-state/no-results',
    title: 'EmptyState / No Results',
    description: 'Centered empty result message with optional action hint.',
    mount(parent) {
      return emptyState({
        box: {
          border: 'line',
          height: 8,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 44,
        },
        data: {
          action: 'Press / to search again',
          description: 'Try a different query or clear your filters.',
          title: 'No results',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'error-state/load-failed',
    title: 'ErrorState / Load Failed',
    description: 'Centered error message with cause and retry hint.',
    mount(parent) {
      return errorState({
        box: {
          border: 'line',
          height: 8,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 44,
        },
        data: {
          cause: 'Connection refused',
          message: 'Failed to load projects',
          retry: 'Press r to retry',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'heading/section-title',
    title: 'Heading / Section Title',
    description: 'Hierarchical heading with semantic tone and underline.',
    mount(parent) {
      return heading({
        box: {
          height: 2,
          left: 3,
          top: 2,
          width: 42,
        },
        data: {
          content: 'Deployment pipeline',
          level: 2,
          tone: 'primary',
          underline: true,
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'kbd/save-shortcut',
    title: 'Kbd / Save Shortcut',
    description: 'Keyboard shortcut chords normalized for terminal help.',
    mount(parent) {
      return kbd({
        box: {
          height: 1,
          left: 3,
          top: 2,
          width: 28,
        },
        data: {
          keys: ['C-s', 'M-enter'],
          tone: 'primary',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'label/required-field',
    title: 'Label / Required Field',
    description: 'Stable one-line label with required marker and muted tone.',
    mount(parent) {
      return label({
        box: {
          height: 1,
          left: 3,
          top: 2,
          width: 24,
        },
        data: {
          content: 'Project',
          required: true,
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'muted-text/hint',
    title: 'MutedText / Hint',
    description: 'Secondary copy rendered with muted semantic tone.',
    mount(parent) {
      return mutedText({
        box: {
          height: 2,
          left: 3,
          top: 2,
          width: 34,
        },
        data: {
          content: 'Last updated 2 minutes ago. Press r to refresh.',
          overflow: 'wrap',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'trend/revenue',
    title: 'Trend / Revenue',
    description: 'Directional metric change with semantic tone and text fallback.',
    mount(parent) {
      return trend({
        box: {
          height: 1,
          left: 3,
          top: 2,
          width: 34,
        },
        data: {
          direction: 'up',
          label: 'vs last month',
          mode: 'symbol-text',
          value: '12.5%',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'step-indicator/deploy',
    title: 'StepIndicator / Deploy',
    description: 'Vertical process steps with completed, active, and pending states.',
    mount(parent) {
      return stepIndicator({
        box: {
          border: 'line',
          height: 8,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 44,
        },
        data: {
          steps: [
            { id: 'install', label: 'Install dependencies', state: 'completed' },
            { detail: 'running checks', id: 'test', label: 'Test package', state: 'active' },
            { id: 'publish', label: 'Publish release' },
          ],
          tone: 'primary',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'progress-list/services',
    title: 'ProgressList / Services',
    description: 'Aligned service progress rows with derived track width.',
    mount(parent) {
      return progressList({
        box: {
          border: 'line',
          height: 7,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 48,
        },
        data: {
          items: [
            { id: 'api', label: 'API', value: 92 },
            { id: 'worker', label: 'Worker', value: 68 },
            { id: 'cache', label: 'Cache warmup', value: 44 },
          ],
          tone: 'primary',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'progress-stack/test-results',
    title: 'ProgressStack / Test Results',
    description: 'Segmented progress across result categories with a legend.',
    mount(parent) {
      return progressStack({
        box: {
          border: 'line',
          height: 7,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 46,
        },
        data: {
          segments: [
            { id: 'passed', label: 'Passed', value: 128 },
            { id: 'failed', label: 'Failed', value: 6 },
            { id: 'skipped', label: 'Skipped', value: 12 },
          ],
          tone: 'primary',
          width: 28,
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'task-progress/release',
    title: 'TaskProgress / Release',
    description: 'Task status summary with activity, progress, and steps.',
    mount(parent) {
      return taskProgress({
        box: {
          border: 'line',
          height: 9,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 48,
        },
        data: {
          activity: 'Running validation suite',
          steps: [
            { id: 'install', label: 'Install dependencies', state: 'completed' },
            { id: 'test', label: 'Run tests', state: 'active' },
            { id: 'publish', label: 'Publish package' },
          ],
          title: 'Release',
          tone: 'primary',
          value: 58,
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'scroll-area/logs',
    title: 'ScrollArea / Logs',
    description: 'Focusable vertical content with keyboard, wheel, and visible scrollbar.',
    mount(parent) {
      const logs = scrollArea({
        box: {
          border: 'line',
          height: 10,
          left: 3,
          top: 1,
          width: 48,
        },
        data: {
          borderTone: 'primary',
          contentHeight: 18,
          scrollbarTone: 'primary',
        },
        parent,
      });

      for (let row = 0; row < 18; row += 1) {
        text({
          box: { height: 1, left: 1, right: 1, top: row },
          data: {
            content: `${String(row + 1).padStart(2, '0')}  service event ${row + 1}`,
            tone: row % 4 === 0 ? 'info' : 'foreground',
          },
          parent: logs.contentElement,
        });
      }

      return logs;
    },
  }),
  defineStory({
    id: 'viewport/canvas',
    title: 'Viewport / Canvas',
    description: 'Clipped two-dimensional content translated with bounded offsets.',
    mount(parent) {
      const canvas = viewport({
        box: {
          border: 'line',
          height: 9,
          left: 3,
          top: 1,
          width: 42,
        },
        data: {
          borderTone: 'primary',
          contentHeight: 16,
          contentWidth: 70,
        },
        parent,
      });

      text({
        box: { height: 1, left: 2, top: 1, width: 24 },
        data: { content: 'Origin: x=2, y=1', tone: 'muted' },
        parent: canvas.contentElement,
      });
      text({
        box: { height: 2, left: 42, top: 10, width: 24 },
        data: {
          content: 'Visible after ensureVisible\nx=42, y=10',
          tone: 'success',
        },
        parent: canvas.contentElement,
      });
      canvas.ensureVisible({
        height: 2,
        width: 24,
        x: 42,
        y: 10,
      });

      return canvas;
    },
  }),
  defineStory({
    id: 'button/actions',
    title: 'Button / Actions',
    description: 'Focusable action activated with Enter, Space, or mouse click.',
    mount(parent) {
      const handlePress = (): void => {
        action.setData({
          label: 'Deployed',
          onPress: handlePress,
          tone: 'success',
        });
        parent.screen.render();
      };
      const action = button({
        box: { height: 1, left: 3, top: 3, width: 24 },
        data: {
          label: 'Deploy',
          onPress: handlePress,
        },
        parent,
      });

      return {
        destroy() {
          action.destroy();
        },
        focus() {
          action.focus();
        },
      };
    },
  }),
  defineStory({
    id: 'icon-button/compact-action',
    title: 'IconButton / Compact Action',
    description: 'Icon-only action with required text description.',
    mount(parent) {
      const refresh = iconButton({
        box: { height: 1, left: 3, top: 3, width: 8 },
        data: {
          icon: '↻',
          label: 'Refresh data',
        },
        parent,
      });
      const close = iconButton({
        box: { height: 1, left: 14, top: 3, width: 18 },
        data: {
          icon: '×',
          label: 'Close panel',
          showLabel: true,
        },
        parent,
      });

      return {
        destroy() {
          refresh.destroy();
          close.destroy();
        },
        focus() {
          refresh.focus();
        },
      };
    },
  }),
  defineStory({
    id: 'checkbox/toggle',
    title: 'Checkbox / Toggle',
    description: 'Boolean option with keyboard and mouse toggling.',
    mount(parent) {
      let checked = false;

      const handleCheckedChange = (nextChecked: boolean): void => {
        checked = nextChecked;
        option.setData({
          checked,
          label: 'Include prereleases',
          onCheckedChange: handleCheckedChange,
        });
        parent.screen.render();
      };
      const option = checkbox({
        box: { height: 1, left: 3, top: 3, width: 34 },
        data: {
          checked,
          label: 'Include prereleases',
          onCheckedChange: handleCheckedChange,
        },
        parent,
      });

      return {
        destroy() {
          option.destroy();
        },
        focus() {
          option.focus();
        },
      };
    },
  }),
  defineStory({
    id: 'radio-group/release-channel',
    title: 'RadioGroup / Release Channel',
    description: 'Single visible choice with keyboard selection.',
    mount(parent) {
      let value = 'stable';

      const items = [
        { id: 'stable', label: 'Stable' },
        { id: 'beta', label: 'Beta' },
        { disabled: true, id: 'nightly', label: 'Nightly' },
      ] as const;
      const handleValueChange = (nextValue: string): void => {
        value = nextValue;
        group.setData({ items, onValueChange: handleValueChange, value });
        parent.screen.render();
      };
      const group = radioGroup({
        box: {
          border: 'line',
          height: 5,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 32,
        },
        data: { items, onValueChange: handleValueChange, value },
        parent,
      });

      return {
        destroy() {
          group.destroy();
        },
        focus() {
          group.focus();
        },
      };
    },
  }),
  defineStory({
    id: 'text-field/environment',
    title: 'TextField / Environment',
    description: 'Single-line input with label, hint, and submit callback.',
    mount(parent) {
      let value = 'production';

      const handleValueChange = (nextValue: string): void => {
        value = nextValue;
        field.setData({
          hint: 'Press Enter to submit the deploy target.',
          label: 'Environment',
          onSubmit: handleSubmit,
          onValueChange: handleValueChange,
          placeholder: 'production',
          required: true,
          value,
        });
        parent.screen.render();
      };
      const handleSubmit = (nextValue: string): void => {
        field.setData({
          hint: `Last submitted: ${nextValue}`,
          label: 'Environment',
          onSubmit: handleSubmit,
          onValueChange: handleValueChange,
          placeholder: 'production',
          required: true,
          value,
        });
        parent.screen.render();
      };
      const field = textField({
        box: {
          border: 'line',
          height: 5,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 44,
        },
        data: {
          hint: 'Press Enter to submit the deploy target.',
          label: 'Environment',
          onSubmit: handleSubmit,
          onValueChange: handleValueChange,
          placeholder: 'production',
          required: true,
          value,
        },
        parent,
      });

      return {
        destroy() {
          field.destroy();
        },
        focus() {
          field.focus();
        },
      };
    },
  }),
  defineStory({
    id: 'number-field/replicas',
    title: 'NumberField / Replicas',
    description: 'Numeric input with bounds and step controls.',
    mount(parent) {
      let value = 3;

      const handleValueChange = (nextValue: number | undefined): void => {
        value = nextValue ?? 0;
        field.setData({
          hint: 'Use Up/Down to adjust, Enter to submit.',
          label: 'Replicas',
          max: 10,
          min: 0,
          onInvalidInput: handleInvalidInput,
          onSubmit: handleSubmit,
          onValueChange: handleValueChange,
          step: 1,
          value,
        });
        parent.screen.render();
      };
      const handleInvalidInput = (_input: string, reason: string): void => {
        field.setData({
          error: `Invalid number: ${reason}`,
          label: 'Replicas',
          max: 10,
          min: 0,
          onInvalidInput: handleInvalidInput,
          onSubmit: handleSubmit,
          onValueChange: handleValueChange,
          step: 1,
          value,
        });
        parent.screen.render();
      };
      const handleSubmit = (nextValue: number): void => {
        field.setData({
          hint: `Submitted ${nextValue} replicas.`,
          label: 'Replicas',
          max: 10,
          min: 0,
          onInvalidInput: handleInvalidInput,
          onSubmit: handleSubmit,
          onValueChange: handleValueChange,
          step: 1,
          value,
        });
        parent.screen.render();
      };
      const field = numberField({
        box: {
          border: 'line',
          height: 5,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 44,
        },
        data: {
          hint: 'Use Up/Down to adjust, Enter to submit.',
          label: 'Replicas',
          max: 10,
          min: 0,
          onInvalidInput: handleInvalidInput,
          onSubmit: handleSubmit,
          onValueChange: handleValueChange,
          step: 1,
          value,
        },
        parent,
      });

      return {
        destroy() {
          field.destroy();
        },
        focus() {
          field.focus();
        },
      };
    },
  }),
  defineStory({
    id: 'password-field/token',
    title: 'PasswordField / Token',
    description: 'Masked secret input with reveal toggle.',
    mount(parent) {
      let reveal = false;
      let value = 'sk_live_secret';

      const handleRevealChange = (nextReveal: boolean): void => {
        reveal = nextReveal;
        field.setData({
          hint: reveal ? 'Token visible. Ctrl-R hides it.' : 'Ctrl-R reveals the token.',
          label: 'API token',
          onRevealChange: handleRevealChange,
          onSubmit: handleSubmit,
          onValueChange: handleValueChange,
          placeholder: 'paste token',
          reveal,
          required: true,
          value,
        });
        parent.screen.render();
      };
      const handleValueChange = (nextValue: string): void => {
        value = nextValue;
        field.setData({
          hint: reveal ? 'Token visible. Ctrl-R hides it.' : 'Ctrl-R reveals the token.',
          label: 'API token',
          onRevealChange: handleRevealChange,
          onSubmit: handleSubmit,
          onValueChange: handleValueChange,
          placeholder: 'paste token',
          reveal,
          required: true,
          value,
        });
        parent.screen.render();
      };
      const handleSubmit = (nextValue: string): void => {
        field.setData({
          hint: `Submitted ${nextValue.length} characters.`,
          label: 'API token',
          onRevealChange: handleRevealChange,
          onSubmit: handleSubmit,
          onValueChange: handleValueChange,
          placeholder: 'paste token',
          reveal,
          required: true,
          value,
        });
        parent.screen.render();
      };
      const field = passwordField({
        box: {
          border: 'line',
          height: 5,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 44,
        },
        data: {
          hint: 'Ctrl-R reveals the token.',
          label: 'API token',
          onRevealChange: handleRevealChange,
          onSubmit: handleSubmit,
          onValueChange: handleValueChange,
          placeholder: 'paste token',
          reveal,
          required: true,
          value,
        },
        parent,
      });

      return {
        destroy() {
          field.destroy();
        },
        focus() {
          field.focus();
        },
      };
    },
  }),
  defineStory({
    id: 'search-field/filter',
    title: 'SearchField / Filter',
    description: 'Query input with clear and submit actions.',
    mount(parent) {
      let query = 'api';

      const handleQueryChange = (nextQuery: string): void => {
        query = nextQuery;
        field.setData({
          hint: 'Escape clears, Enter submits.',
          label: 'Filter services',
          onClear: handleClear,
          onQueryChange: handleQueryChange,
          onSubmit: handleSubmit,
          placeholder: 'service name',
          query,
        });
        parent.screen.render();
      };
      const handleClear = (): void => {
        query = '';
        field.setData({
          hint: 'Filter cleared.',
          label: 'Filter services',
          onClear: handleClear,
          onQueryChange: handleQueryChange,
          onSubmit: handleSubmit,
          placeholder: 'service name',
          query,
        });
        parent.screen.render();
      };
      const handleSubmit = (submittedQuery: string): void => {
        field.setData({
          hint: `Submitted: ${submittedQuery || 'empty query'}`,
          label: 'Filter services',
          onClear: handleClear,
          onQueryChange: handleQueryChange,
          onSubmit: handleSubmit,
          placeholder: 'service name',
          query,
        });
        parent.screen.render();
      };
      const field = searchField({
        box: {
          border: 'line',
          height: 5,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 44,
        },
        data: {
          hint: 'Escape clears, Enter submits.',
          label: 'Filter services',
          onClear: handleClear,
          onQueryChange: handleQueryChange,
          onSubmit: handleSubmit,
          placeholder: 'service name',
          query,
        },
        parent,
      });

      return {
        destroy() {
          field.destroy();
        },
        focus() {
          field.focus();
        },
      };
    },
  }),
  defineStory({
    id: 'select/environment',
    title: 'Select / Environment',
    description: 'Compact single-selection input with keyboard navigation.',
    mount(parent) {
      let value = 'prod';
      let open = true;

      const items = [
        { id: 'prod', label: 'Production' },
        { id: 'stage', label: 'Staging' },
        { disabled: true, id: 'dev', label: 'Development' },
      ] as const;
      const sync = (): void => {
        field.setData({
          items,
          onOpenChange: handleOpenChange,
          onValueChange: handleValueChange,
          open,
          placeholder: 'Choose environment',
          value,
        });
        parent.screen.render();
      };
      const handleOpenChange = (nextOpen: boolean): void => {
        open = nextOpen;
        sync();
      };
      const handleValueChange = (nextValue: string): void => {
        value = nextValue;
        open = false;
        sync();
      };
      const field = select({
        box: {
          border: 'line',
          height: 5,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 36,
        },
        data: {
          items,
          onOpenChange: handleOpenChange,
          onValueChange: handleValueChange,
          open,
          placeholder: 'Choose environment',
          value,
        },
        parent,
      });

      return {
        destroy() {
          field.destroy();
        },
        focus() {
          field.focus();
        },
      };
    },
  }),
  defineStory({
    id: 'multi-select/services',
    title: 'MultiSelect / Services',
    description: 'Multiple visible choices with a compact selected summary.',
    mount(parent) {
      let values = ['api'];
      let open = true;

      const items = [
        { id: 'api', label: 'API' },
        { id: 'worker', label: 'Worker' },
        { disabled: true, id: 'db', label: 'Database' },
      ] as const;
      const sync = (): void => {
        field.setData({
          items,
          onOpenChange: handleOpenChange,
          onValuesChange: handleValuesChange,
          open,
          placeholder: 'Choose services',
          values,
        });
        parent.screen.render();
      };
      const handleOpenChange = (nextOpen: boolean): void => {
        open = nextOpen;
        sync();
      };
      const handleValuesChange = (nextValues: readonly string[]): void => {
        values = [...nextValues];
        sync();
      };
      const field = multiSelect({
        box: {
          border: 'line',
          height: 5,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 36,
        },
        data: {
          items,
          onOpenChange: handleOpenChange,
          onValuesChange: handleValuesChange,
          open,
          placeholder: 'Choose services',
          values,
        },
        parent,
      });

      return {
        destroy() {
          field.destroy();
        },
        focus() {
          field.focus();
        },
      };
    },
  }),
  defineStory({
    id: 'switch/auto-deploy',
    title: 'Switch / Auto Deploy',
    description: 'Immediate boolean setting with keyboard and mouse toggling.',
    mount(parent) {
      let checked = true;

      const handleCheckedChange = (nextChecked: boolean): void => {
        checked = nextChecked;
        setting.setData({
          checked,
          label: 'Auto deploy',
          offText: 'manual',
          onCheckedChange: handleCheckedChange,
          onText: 'enabled',
        });
        parent.screen.render();
      };
      const setting = switchControl({
        box: { height: 1, left: 3, top: 3, width: 36 },
        data: {
          checked,
          label: 'Auto deploy',
          offText: 'manual',
          onCheckedChange: handleCheckedChange,
          onText: 'enabled',
        },
        parent,
      });

      return {
        destroy() {
          setting.destroy();
        },
        focus() {
          setting.focus();
        },
      };
    },
  }),
  defineStory({
    id: 'form-field/basic',
    title: 'FormField / Basic',
    description: 'Label, required marker, composed control content, and hint row.',
    mount(parent) {
      return formField({
        box: {
          border: 'line',
          height: 5,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 42,
        },
        data: {
          control: '[ production ]',
          hint: 'Used by deploy and rollback commands.',
          label: 'Environment',
          required: true,
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'tabs/views',
    title: 'Tabs / Views',
    description: 'Horizontal view switching with disabled tabs and keyboard focus.',
    mount(parent) {
      return tabs({
        parent,
        box: {
          border: 'line',
          height: 3,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 54,
        },
        data: {
          defaultValue: 'overview',
          items: [
            { id: 'overview', label: 'Overview' },
            { id: 'metrics', label: 'Metrics' },
            { id: 'logs', label: 'Logs' },
            { disabled: true, id: 'deploy', label: 'Deploy' },
          ],
        },
      });
    },
  }),
  defineStory({
    id: 'dropdown-menu/app-actions',
    title: 'DropdownMenu / App Actions',
    description: 'Top menu bar with keyboard and mouse dropdown actions.',
    mount(parent) {
      return dropdownMenu({
        box: {
          border: 'line',
          height: 7,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 46,
        },
        data: {
          focusedId: 'file',
          items: [
            {
              id: 'file',
              items: [
                { id: 'new', label: 'New project', shortcut: 'n' },
                { id: 'open', label: 'Open workspace', shortcut: 'o' },
                { disabled: true, id: 'publish', label: 'Publish release', shortcut: 'p' },
              ],
              label: 'File',
            },
            {
              id: 'view',
              items: [
                { id: 'logs', label: 'Show logs', shortcut: 'l' },
                { id: 'palette', label: 'Command palette', shortcut: 'C-p' },
              ],
              label: 'View',
            },
            {
              id: 'help',
              items: [{ id: 'shortcuts', label: 'Keyboard shortcuts', shortcut: '?' }],
              label: 'Help',
            },
          ],
          openId: 'file',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'tab-list/triggers',
    title: 'TabList / Triggers',
    description: 'Compound tab trigger row for composing custom panel systems.',
    mount(parent) {
      return tabList({
        parent,
        box: {
          border: 'line',
          height: 3,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 54,
        },
        data: {
          defaultValue: 'summary',
          items: [
            { id: 'summary', label: 'Summary' },
            { id: 'activity', label: 'Activity' },
            { id: 'settings', label: 'Settings' },
            { disabled: true, id: 'billing', label: 'Billing' },
          ],
        },
      });
    },
  }),
  defineStory({
    id: 'menu/actions',
    title: 'Menu / Actions',
    description: 'Vertical action navigation with shortcuts and disabled items.',
    mount(parent) {
      return menu({
        parent,
        box: {
          border: 'line',
          height: 7,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 38,
        },
        data: {
          items: [
            { id: 'build', label: 'Build package', shortcut: 'b' },
            { id: 'test', label: 'Run tests', shortcut: 't' },
            { id: 'deploy', label: 'Deploy', shortcut: 'd' },
            { disabled: true, id: 'rollback', label: 'Rollback', shortcut: 'r' },
          ],
        },
      });
    },
  }),
  defineStory({
    id: 'menu-bar/top-level',
    title: 'MenuBar / Top Level',
    description: 'Horizontal top-level menu navigation with disabled items.',
    mount(parent) {
      return menuBar({
        parent,
        box: {
          border: 'line',
          height: 3,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 48,
        },
        data: {
          defaultValue: 'file',
          items: [
            { id: 'file', label: 'File' },
            { id: 'edit', label: 'Edit' },
            { id: 'view', label: 'View' },
            { disabled: true, id: 'deploy', label: 'Deploy' },
          ],
        },
      });
    },
  }),
  defineStory({
    id: 'navigation-list/routes',
    title: 'NavigationList / Routes',
    description: 'Route navigation with separate active and focused states.',
    mount(parent) {
      return navigationList({
        parent,
        box: {
          border: 'line',
          height: 8,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 38,
        },
        data: {
          defaultValue: 'overview',
          items: [
            { id: 'overview', label: 'Overview' },
            { id: 'deployments', label: 'Deployments', badge: '12' },
            { id: 'logs', label: 'Logs', badge: 'live' },
            { disabled: true, id: 'billing', label: 'Billing' },
          ],
        },
      });
    },
  }),
  defineStory({
    id: 'pagination/results',
    title: 'Pagination / Results',
    description: 'Bounded page navigation with keyboard, mouse, and wheel controls.',
    mount(parent) {
      return pagination({
        parent,
        box: {
          border: 'line',
          height: 3,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 44,
        },
        data: {
          defaultPage: 5,
          pageCount: 18,
          showBoundaryControls: true,
          siblingCount: 1,
        },
      });
    },
  }),
  defineStory({
    id: 'pager/records',
    title: 'Pager / Records',
    description: 'Compact previous and next navigation for bounded records.',
    mount(parent) {
      return pager({
        parent,
        box: {
          border: 'line',
          height: 3,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 42,
        },
        data: {
          defaultPage: 3,
          pageCount: 9,
        },
      });
    },
  }),
  defineStory({
    id: 'help-overlay/shortcuts',
    title: 'HelpOverlay / Shortcuts',
    description: 'Searchable keyboard shortcut reference grouped by area.',
    mount(parent) {
      return helpOverlay({
        parent,
        box: {
          border: 'line',
          height: 10,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 54,
        },
        data: {
          defaultOpen: true,
          sections: [
            {
              items: [
                { description: 'Open command palette', id: 'palette', keys: ['C-p'] },
                { description: 'Toggle help overlay', id: 'help', keys: ['?'] },
                { description: 'Focus search', id: 'search', keys: ['/'] },
              ],
              title: 'Global',
            },
            {
              items: [
                { description: 'Move selection down', id: 'move-down', keys: ['down', 'j'] },
                { description: 'Move selection up', id: 'move-up', keys: ['up', 'k'] },
              ],
              title: 'Navigation',
            },
          ],
        },
      });
    },
  }),
  defineStory({
    id: 'overlay/modal-layer',
    title: 'Overlay / Modal Layer',
    description: 'Shared full-screen layer for composing modal or transient UI.',
    mount(parent) {
      const layer = overlay({
        data: {
          defaultOpen: true,
          id: 'preview-overlay',
          modal: true,
        },
        parent,
      });
      const panel = text({
        box: {
          border: 'line',
          height: 7,
          left: 5,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 46,
        },
        data: {
          content: 'Overlay layer\n\nCompose any child content here.\nEsc closes the top layer.',
          overflow: 'wrap',
        },
        parent: layer.element,
      });

      return {
        destroy() {
          panel.destroy();
          layer.destroy();
        },
        focus() {
          layer.focus();
        },
      };
    },
  }),
  defineStory({
    id: 'dialog/basic',
    title: 'Dialog / Basic',
    description: 'Modal composition with title, description, body, footer, and focus capture.',
    mount(parent) {
      const root = dialogRoot({
        data: {
          defaultOpen: true,
          id: 'preview-dialog',
        },
        parent,
      });
      const content = dialogContent({
        box: { height: 10, left: 4, top: 1, width: 52 },
        parent: root.element,
      });

      dialogTitle({
        data: { content: 'Deploy service' },
        parent: content.element,
      });
      dialogDescription({
        data: { content: 'Production environment' },
        parent: content.element,
      });
      dialogBody({
        data: { content: 'All checks passed.\nContinue with deployment?' },
        parent: content.element,
      });
      dialogFooter({
        data: { content: 'Tab move focus · Esc close' },
        parent: content.element,
      });

      return root;
    },
  }),
  defineStory({
    id: 'drawer/settings',
    title: 'Drawer / Settings',
    description: 'Edge-attached modal panel with composed regions.',
    mount(parent) {
      const root = drawerRoot({
        data: {
          defaultOpen: true,
          id: 'preview-drawer',
        },
        parent,
      });
      const content = drawerContent({
        data: { edge: 'right', size: 36 },
        parent: root.element,
      });

      drawerHeader({
        data: { content: 'Deploy settings' },
        parent: content.element,
      });
      drawerBody({
        data: {
          content: ['Environment: production', 'Replicas: 4', 'Strategy: rolling'].join('\n'),
        },
        parent: content.element,
      });
      drawerFooter({
        data: { content: 'Esc close' },
        parent: content.element,
      });

      return root;
    },
  }),
  defineStory({
    id: 'spotlight/actions',
    title: 'Spotlight / Actions',
    description: 'Searchable command overlay with action results.',
    mount(parent) {
      return spotlight({
        content: { height: 10, top: 1, width: 56 },
        data: {
          defaultOpen: true,
          defaultQuery: 'de',
          id: 'preview-spotlight',
          items: [
            { id: 'build', label: 'Build package', shortcut: 'b' },
            { id: 'deploy', keywords: ['release'], label: 'Deploy service', shortcut: 'd' },
            { id: 'logs', label: 'Open deployment logs', shortcut: 'l' },
            { disabled: true, id: 'rollback', label: 'Rollback production', shortcut: 'r' },
          ],
          placeholder: 'Search commands',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'spinner/loading',
    title: 'Spinner / Loading',
    description: 'Animated Unicode activity indicator with semantic tone.',
    mount(parent) {
      const loading = spinner({
        box: { height: 1, left: 3, top: 3, width: 30 },
        data: {
          label: 'Deploying services',
          onFrame() {
            parent.screen.render();
          },
          tone: 'primary',
        },
        parent,
      });

      return loading;
    },
  }),
  defineStory({
    id: 'status/health',
    title: 'Status / Health',
    description: 'Inline semantic state with detail text and automatic ASCII fallback.',
    mount(parent) {
      const elements = [
        status({
          box: { height: 1, left: 3, top: 2, width: 30 },
          data: { detail: '24ms', label: 'API healthy', tone: 'success' },
          parent,
        }),
        status({
          box: { height: 1, left: 3, top: 4, width: 30 },
          data: { detail: 'retrying', label: 'Worker delayed', tone: 'warning' },
          parent,
        }),
        status({
          box: { height: 1, left: 3, top: 6, width: 30 },
          data: {
            capabilities: { colorLevel: 1, unicode: false },
            label: 'Cache offline',
            tone: 'danger',
          },
          parent,
        }),
      ];

      return {
        destroy() {
          for (const element of elements) {
            element.destroy();
          }
        },
      };
    },
  }),
  defineStory({
    id: 'divider/labels',
    title: 'Divider / Labels',
    description: 'Cell-aware labels with Unicode and semantic border tone.',
    mount(parent) {
      const elements = [
        divider({
          box: { height: 1, left: 3, top: 2, width: 42 },
          data: { label: 'Services' },
          parent,
        }),
        divider({
          box: { height: 1, left: 3, top: 5, width: 42 },
          data: {
            label: '状态',
            labelAlign: 'start',
            tone: 'primary',
          },
          parent,
        }),
      ];

      return {
        destroy() {
          for (const element of elements) {
            element.destroy();
          }
        },
      };
    },
  }),
  defineStory({
    id: 'stack/vertical',
    title: 'Stack / Vertical',
    description: 'Direct children flow vertically with a consistent terminal-row gap.',
    mount(parent) {
      const layout = stack({
        box: {
          border: 'line',
          height: 10,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 42,
        },
        data: {
          borderTone: 'primary',
          gap: 1,
        },
        parent,
      });

      text({
        box: { height: 1, width: 20 },
        data: { content: 'API', tone: 'primary' },
        parent: layout.element,
      });
      text({
        box: { height: 2, width: 24 },
        data: { content: 'Healthy\n84ms latency', tone: 'success' },
        parent: layout.element,
      });
      text({
        box: { height: 1, width: 18 },
        data: { content: '3 replicas ready', tone: 'muted' },
        parent: layout.element,
      });
      layout.layout();

      return layout;
    },
  }),
  defineStory({
    id: 'sidebar-layout/responsive',
    title: 'SidebarLayout / Responsive',
    description: 'Sidebar and main regions with explicit and width-based collapse.',
    mount(parent) {
      const layout = sidebarLayout({
        box: {
          border: 'line',
          height: 12,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 54,
        },
        data: {
          borderTone: 'primary',
          collapseBelow: 42,
          gap: 1,
          mainContent: 'Service details\n\nStatus: healthy\nLatency: 84ms p95\nReplicas: 3/3',
          sidebarContent: 'Deployments\nLogs\nMetrics\nSettings',
          sidebarWidth: 16,
        },
        parent,
      });

      return layout;
    },
  }),
  defineStory({
    id: 'page/service-overview',
    title: 'Page / Service Overview',
    description: 'Full-screen header, body, and footer regions with mounted content.',
    mount(parent) {
      const view = page({
        box: {
          border: 'line',
          height: 13,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 54,
        },
        data: {
          actions: 'r refresh  q quit',
          borderTone: 'primary',
          content: 'API service\nStatus: healthy\nLatency: 84ms p95\nReplicas: 3/3',
          footer: 'Updated now',
          gap: 1,
          subtitle: 'production',
          title: 'Service overview',
        },
        parent,
      });

      return view;
    },
  }),
  defineStory({
    id: 'app-shell/operations-frame',
    title: 'AppShell / Operations Frame',
    description: 'Application frame with header, sidebar, content, footer, and overlay layer.',
    mount(parent) {
      return appShell({
        box: {
          border: 'line',
          height: 13,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 58,
        },
        data: {
          borderTone: 'primary',
          content: 'Production\n\nAPI healthy\nQueue depth: 12\nDeploy window: open',
          footerContent: 'tab focus  r refresh  q quit',
          gap: 1,
          headerContent: 'Deployments  production',
          overlayContent: 'Overlay layer hidden',
          sidebarContent: 'Services\nDeploys\nLogs\nSettings',
          sidebarWidth: 16,
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'accordion/deploy-checks',
    title: 'Accordion / Deploy Checks',
    description: 'Keyboard navigation across persistent collapsible sections.',
    mount(parent) {
      const checks = accordion({
        box: {
          border: 'line',
          height: 13,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 50,
        },
        data: {
          borderTone: 'primary',
          defaultExpandedIds: ['build'],
          gap: 1,
          sectionGap: 1,
          sections: [
            {
              bodyHeight: 3,
              content: 'Compile packages\nBundle adapters\nEmit declarations',
              id: 'build',
              title: 'Build',
            },
            {
              bodyHeight: 3,
              content: 'Public API tests\nBlessed integration\nPackage export checks',
              id: 'test',
              title: 'Test',
            },
            {
              bodyHeight: 2,
              content: 'Waiting for approval\nNo deployment yet',
              disabled: true,
              id: 'release',
              title: 'Release',
            },
          ],
        },
        parent,
      });

      return {
        destroy() {
          checks.destroy();
        },
        focus() {
          checks.focus();
        },
      };
    },
  }),
  defineStory({
    id: 'collapsible/persistent-body',
    title: 'Collapsible / Persistent Body',
    description: 'Toggle a mounted body region while preserving child state.',
    mount(parent) {
      const panel = collapsible({
        box: {
          border: 'line',
          height: 9,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 46,
        },
        data: {
          bodyHeight: 5,
          borderTone: 'primary',
          content: 'Status: ready\nReplicas: 3/3\nQueue: 12 pending\nUpdated: now',
          defaultExpanded: true,
          gap: 1,
          headerTone: 'primary',
          title: 'Service details',
        },
        parent,
      });
      const disabled = collapsible({
        box: {
          height: 3,
          left: 3,
          top: 11,
          width: 46,
        },
        data: {
          bodyHeight: 1,
          content: 'Hidden until enabled by the application.',
          disabled: true,
          title: 'Archived checks',
        },
        parent,
      });

      return {
        destroy() {
          disabled.destroy();
          panel.destroy();
        },
        focus() {
          panel.focus();
        },
      };
    },
  }),
  defineStory({
    id: 'center/empty-state',
    title: 'Center / Empty State',
    description: 'One direct child centered within the available container.',
    mount(parent) {
      const layout = center({
        box: {
          border: 'line',
          height: 10,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 44,
        },
        data: {
          borderTone: 'primary',
        },
        parent,
      });

      text({
        box: { height: 3, width: 28 },
        data: {
          align: 'center',
          content: 'No incidents\nEverything is calm',
          tone: 'success',
        },
        parent: layout.element,
      });
      layout.layout();

      return layout;
    },
  }),
  defineStory({
    id: 'cluster/actions',
    title: 'Cluster / Actions',
    description: 'Inline children wrap into rows for action bars and badges.',
    mount(parent) {
      const layout = cluster({
        box: {
          border: 'line',
          height: 8,
          left: 3,
          padding: { left: 1, right: 1, top: 1 },
          top: 2,
          width: 34,
        },
        data: {
          borderTone: 'primary',
          gap: 1,
        },
        parent,
      });

      for (const label of ['Deploy', 'Rollback', 'Scale', 'Logs', 'Metrics']) {
        text({
          box: { border: 'line', height: 3, width: label.length + 4 },
          data: { align: 'center', content: label, tone: 'info' },
          parent: layout.element,
        });
      }

      layout.layout();

      return layout;
    },
  }),
  defineStory({
    id: 'spacer/stack-gap',
    title: 'Spacer / Stack Gap',
    description: 'Fixed empty space participates as a direct layout child.',
    mount(parent) {
      const layout = stack({
        box: {
          border: 'line',
          height: 10,
          left: 3,
          padding: { left: 1, right: 1, top: 1 },
          top: 1,
          width: 42,
        },
        data: {
          borderTone: 'primary',
        },
        parent,
      });

      text({
        box: { height: 1, width: 24 },
        data: { content: 'Header region', tone: 'primary' },
        parent: layout.element,
      });
      spacer({
        data: { axis: 'vertical', size: 2 },
        parent: layout.element,
      });
      text({
        box: { height: 2, width: 28 },
        data: { content: 'Body starts after\nan explicit spacer', tone: 'muted' },
        parent: layout.element,
      });
      layout.layout();

      return layout;
    },
  }),
  defineStory({
    id: 'grid/dashboard-panels',
    title: 'Grid / Dashboard Panels',
    description: 'Row and column placement with spans for dashboard composition.',
    mount(parent) {
      const layout = grid({
        box: {
          border: 'line',
          height: 12,
          left: 3,
          padding: { bottom: 1, left: 1, right: 1, top: 1 },
          top: 1,
          width: 52,
        },
        data: {
          borderTone: 'primary',
          columns: 3,
          gap: 1,
          items: [{ columnSpan: 2 }, {}, { column: 0, columnSpan: 3, row: 1 }],
          rows: 2,
        },
        parent,
      });

      text({
        box: { border: 'line' },
        data: { content: 'API\nHealthy\n84ms p95', tone: 'success' },
        parent: layout.element,
      });
      text({
        box: { border: 'line' },
        data: { content: 'Queue\n12 pending', tone: 'warning' },
        parent: layout.element,
      });
      text({
        box: { border: 'line' },
        data: { content: 'Deploy timeline\nbuild -> test -> release', tone: 'muted' },
        parent: layout.element,
      });
      layout.layout();

      return layout;
    },
  }),
  defineStory({
    id: 'box/themed-container',
    title: 'Box / Themed Container',
    description: 'Composable base container using semantic border and background tokens.',
    mount(parent) {
      const panel = box({
        box: {
          border: 'line',
          height: 7,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 42,
        },
        data: {
          borderTone: 'primary',
        },
        parent,
      });
      const content = text({
        box: { height: 3, left: 0, right: 0, top: 1 },
        data: {
          align: 'center',
          content: 'Composable container\nwith semantic colors',
          tone: 'info',
        },
        parent: panel.element,
      });

      return {
        destroy() {
          content.destroy();
          panel.destroy();
        },
      };
    },
  }),
  defineStory({
    id: 'card/composition',
    title: 'Card / Composition',
    description: 'Independent header, title, description, body, and footer regions.',
    mount(parent) {
      const root = cardRoot({
        box: { height: 10, left: 3, top: 1, width: 48 },
        parent,
      });
      const header = cardHeader({ parent: root.element });

      cardTitle({
        data: { content: 'Production deploy' },
        parent: header.element,
      });
      cardDescription({
        data: { content: 'api-service · us-east-1' },
        parent: header.element,
      });
      cardBody({
        data: {
          content: 'All health checks passing.\n3 replicas ready.\nLatency: 84ms',
        },
        parent: root.element,
      });
      cardFooter({
        data: { content: 'Updated now', tone: 'success' },
        parent: root.element,
      });

      return root;
    },
  }),
  defineStory({
    id: 'text/safe-wrap',
    title: 'Text / Safe Wrap',
    description: 'Cell-aware wrapping strips terminal markup and uses a semantic tone.',
    mount(parent) {
      return text({
        parent,
        box: {
          top: 2,
          left: 3,
          height: 5,
          width: 38,
          border: 'line',
        },
        data: {
          align: 'center',
          content:
            '\u001B[31mDeploying\u001B[0m {red-fg}红色{/red-fg} service across terminal cells.',
          tone: 'info',
          verticalAlign: 'middle',
        },
      });
    },
  }),
  defineStory({
    id: 'list/commands',
    title: 'List / Commands',
    description: 'Interactive selection with disabled rows and bounded scrolling.',
    mount(parent) {
      return list({
        parent,
        box: {
          top: 1,
          left: 3,
          height: 9,
          width: 42,
          border: 'line',
          style: {
            border: {
              fg: 'cyan',
            },
          },
        },
        data: {
          defaultValue: 'test',
          items: [
            { id: 'lint', label: 'Run ESLint' },
            { id: 'test', label: 'Run test suite' },
            { id: 'build', label: 'Build package' },
            { disabled: true, id: 'publish', label: 'Publish release (locked)' },
            { id: 'docs', label: 'Generate API documentation' },
            { id: 'preview', label: 'Open component preview' },
            { id: 'audit', label: 'Audit package contents' },
            { id: 'clean', label: 'Clean generated artifacts' },
          ],
        },
      });
    },
  }),
  defineStory({
    id: 'grouped-list/resources',
    title: 'GroupedList / Resources',
    description: 'Selectable rows organized under section headings.',
    mount(parent) {
      return groupedList({
        box: {
          border: 'line',
          height: 11,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 46,
        },
        data: {
          activeId: 'api',
          defaultValue: 'api',
          sections: [
            {
              id: 'services',
              items: [
                { id: 'api', label: 'API service' },
                { id: 'worker', label: 'Worker pool' },
              ],
              title: 'Services',
            },
            {
              id: 'infra',
              items: [
                { id: 'redis', label: 'Redis cache' },
                { disabled: true, id: 'db', label: 'Database migration locked' },
              ],
              title: 'Infrastructure',
            },
          ],
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'tree/project-files',
    title: 'Tree / Project Files',
    description: 'Expandable hierarchical navigation with selection and disabled nodes.',
    mount(parent) {
      return tree({
        box: {
          border: 'line',
          height: 12,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 48,
        },
        data: {
          activeId: 'src/components/tree',
          defaultExpandedIds: ['project', 'src', 'src/components'],
          defaultValue: 'src/components/tree',
          nodes: [
            {
              children: [
                {
                  children: [
                    { id: 'src/components/list', label: 'list/index.ts' },
                    { id: 'src/components/tree', label: 'tree/index.ts' },
                    { id: 'src/components/table', label: 'table/index.ts' },
                  ],
                  id: 'src/components',
                  label: 'components',
                },
                {
                  children: [
                    { id: 'src/core/width', label: 'width.ts' },
                    { id: 'src/core/truncate', label: 'truncate.ts' },
                  ],
                  id: 'src/core',
                  label: 'core',
                },
              ],
              id: 'src',
              label: 'src',
            },
            {
              children: [
                { id: 'tests/public-tree', label: 'public-api/tree.test.ts' },
                { id: 'tests/blessed-tree', label: 'blessed-integration/tree.test.ts' },
              ],
              id: 'tests',
              label: 'tests',
            },
            { disabled: true, id: 'dist', label: 'dist (generated)' },
            { id: 'roadmap', label: 'ROADMAP.md' },
          ],
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'diff-view/package-change',
    title: 'DiffView / Package Change',
    description: 'Scrollable unified diff with line numbers and safe truncation.',
    mount(parent) {
      return diffView({
        box: {
          border: 'line',
          height: 11,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 62,
        },
        data: {
          lines: [
            { content: '@@ -12,8 +12,10 @@', type: 'hunk' },
            { content: '  "exports": {', newLine: 12, oldLine: 12, type: 'context' },
            { content: '    "./tree": {', newLine: 13, oldLine: 13, type: 'context' },
            {
              content: '      "import": "./dist/tree/index.js"',
              newLine: 14,
              oldLine: 14,
              type: 'context',
            },
            { content: '    },', newLine: 15, oldLine: 15, type: 'context' },
            { content: '    "./diff-view": {', newLine: 16, type: 'add' },
            {
              content: '      "import": "./dist/diff-view/index.js"',
              newLine: 17,
              type: 'add',
            },
            { content: '    },', newLine: 18, type: 'add' },
            { content: '    "./legacy-diff": "./dist/diff.js"', oldLine: 16, type: 'remove' },
            { content: '  }', newLine: 19, oldLine: 17, type: 'context' },
          ],
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'table/services',
    title: 'Table / Services',
    description: 'Interactive typed rows with aligned columns, selection, and bounded scrolling.',
    mount(parent) {
      return table({
        parent,
        box: {
          border: 'line',
          height: 9,
          left: 3,
          style: {
            border: {
              fg: 'cyan',
            },
          },
          top: 1,
          width: 56,
        },
        data: {
          columns: [
            { header: 'Service', id: 'service' },
            { align: 'right', header: 'CPU', id: 'cpu', width: 6 },
            { align: 'right', header: 'Mem', id: 'memory', width: 7 },
          ],
          defaultValue: 'api',
          rows: [
            { cpu: '42%', id: 'api', memory: '384MB', service: 'API' },
            { cpu: '18%', id: 'worker', memory: '512MB', service: 'Worker' },
            { cpu: '3%', id: 'cache', memory: '96MB', service: 'Cache' },
            { cpu: '0%', disabled: true, id: 'search', memory: '0MB', service: 'Search (paused)' },
            { cpu: '11%', id: 'queue', memory: '128MB', service: 'Queue' },
            { cpu: '7%', id: 'cron', memory: '72MB', service: 'Cron' },
            { cpu: '25%', id: 'realtime', memory: '256MB', service: 'Realtime gateway' },
          ],
        },
      });
    },
  }),
  defineStory({
    id: 'data-table/services',
    title: 'DataTable / Services',
    description: 'Sortable, filterable, paginated rows with a page summary footer.',
    mount(parent) {
      return dataTable({
        parent,
        box: {
          border: 'line',
          height: 8,
          left: 3,
          style: {
            border: {
              fg: 'cyan',
            },
          },
          top: 1,
          width: 56,
        },
        data: {
          columns: [
            { header: 'Service', id: 'service', sortable: true },
            { align: 'right', header: 'CPU', id: 'cpu', sortable: true, width: 6 },
            { align: 'right', header: 'Mem', id: 'memory', width: 7 },
          ],
          defaultSort: { columnId: 'cpu', direction: 'desc' },
          defaultValue: 'api',
          pageSize: 4,
          rows: [
            { cpu: 42, id: 'api', memory: '384MB', service: 'API' },
            { cpu: 18, id: 'worker', memory: '512MB', service: 'Worker' },
            { cpu: 3, id: 'cache', memory: '96MB', service: 'Cache' },
            { cpu: 0, disabled: true, id: 'search', memory: '0MB', service: 'Search (paused)' },
            { cpu: 11, id: 'queue', memory: '128MB', service: 'Queue' },
            { cpu: 7, id: 'cron', memory: '72MB', service: 'Cron' },
            { cpu: 25, id: 'realtime', memory: '256MB', service: 'Realtime gateway' },
          ],
        },
      });
    },
  }),
  defineStory({
    id: 'log-explorer/deploy-filter',
    title: 'LogExplorer / Deploy Filter',
    description: 'Filtered log stream with query, level, source, and scroll behavior.',
    mount(parent) {
      return logExplorer({
        box: {
          border: 'line',
          height: 9,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 58,
        },
        data: {
          entries: [
            {
              id: '1',
              level: 'info',
              message: 'Deploy requested for production',
              source: 'api',
            },
            {
              id: '2',
              level: 'warn',
              message: 'Deploy waiting for queue capacity',
              source: 'worker',
            },
            {
              id: '3',
              level: 'error',
              message: 'Deploy failed health check',
              source: 'api',
            },
            {
              id: '4',
              level: 'info',
              message: 'Metrics exporter heartbeat',
              source: 'metrics',
            },
            {
              id: '5',
              level: 'warn',
              message: 'Deploy retry scheduled',
              source: 'api',
            },
          ],
          filter: {
            levels: ['warn', 'error'],
            query: 'deploy',
          },
          follow: false,
          showTimestamp: false,
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'badge/tones',
    title: 'Badge / Tones',
    description: 'Semantic status badges remain meaningful without color.',
    mount(parent) {
      const elements = [
        badge({
          parent,
          box: { top: 1, left: 3, height: 1, width: 24 },
          data: { text: 'Queued', tone: 'info' },
        }),
        badge({
          parent,
          box: { top: 3, left: 3, height: 1, width: 24 },
          data: { text: 'Passed', tone: 'success' },
        }),
        badge({
          parent,
          box: { top: 5, left: 3, height: 1, width: 24 },
          data: { text: 'Delayed', tone: 'warning' },
        }),
        badge({
          parent,
          box: { top: 7, left: 3, height: 1, width: 24 },
          data: { text: 'Failed', tone: 'danger' },
        }),
      ];

      return {
        destroy() {
          for (const element of elements) {
            element.destroy();
          }
        },
      };
    },
  }),
  defineStory({
    id: 'badge/ascii',
    title: 'Badge / ASCII',
    description: 'Custom delimiters and markers for ASCII-only terminals.',
    mount(parent) {
      return badge({
        parent,
        box: { top: 2, left: 3, height: 1, width: 30 },
        data: {
          delimiters: { close: '>', open: '<' },
          markers: {
            danger: 'x',
            info: 'i',
            neutral: '-',
            success: '+',
            warning: '!',
          },
          text: 'Passed',
          tone: 'success',
        },
      });
    },
  }),
  defineStory({
    id: 'metric-bars/score',
    title: 'MetricBars / Score',
    description: 'Aligned quality metrics sharing one numeric domain.',
    mount(parent) {
      return metricBars({
        parent,
        box: {
          top: 2,
          left: 3,
          height: 6,
          width: 60,
        },
        data: {
          barWidth: 16,
          label: 'Overall',
          metrics: [
            { label: 'Quality', value: 78 },
            { label: 'Popularity', value: 99 },
            { label: 'Maintenance', value: 82 },
          ],
          tone: 'primary',
          value: '85%',
        },
      });
    },
  }),
  defineStory({
    id: 'gauge/cpu',
    title: 'Gauge / CPU',
    description: 'Single bounded value with visible qualitative threshold text.',
    mount(parent) {
      return gauge({
        parent,
        box: {
          border: 'line',
          height: 3,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 42,
        },
        data: {
          label: 'CPU',
          thresholds: [
            { end: 69, label: 'normal' },
            { end: 89, label: 'warning', start: 70 },
            { label: 'critical', start: 90 },
          ],
          tone: 'primary',
          value: 72,
          width: 16,
        },
      });
    },
  }),
  defineStory({
    id: 'stacked-gauge/capacity',
    title: 'StackedGauge / Capacity',
    description: 'Part-to-whole composition in one bounded gauge track.',
    mount(parent) {
      return stackedGauge({
        box: {
          border: 'line',
          height: 6,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 44,
        },
        data: {
          label: 'Capacity',
          segments: [
            { id: 'used', label: 'Used', value: 62 },
            { id: 'reserved', label: 'Reserved', value: 18 },
          ],
          tone: 'primary',
          total: 100,
          width: 20,
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'legend/series',
    title: 'Legend / Series',
    description: 'Chart series labels with text markers for no-color terminals.',
    mount(parent) {
      return legend({
        parent,
        box: {
          border: 'line',
          height: 6,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 36,
        },
        data: {
          items: [
            { description: '42%', id: 'api', label: 'API', marker: '●' },
            { description: '18%', id: 'worker', label: 'Worker', marker: '■' },
            { description: '7%', id: 'cache', label: 'Cache', marker: '▲' },
          ],
          layout: 'vertical',
          tone: 'primary',
        },
      });
    },
  }),
  defineStory({
    id: 'thresholds/cpu-ranges',
    title: 'Thresholds / CPU Ranges',
    description: 'Qualitative numeric ranges with a visible active state.',
    mount(parent) {
      return thresholds({
        parent,
        box: {
          border: 'line',
          height: 3,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 64,
        },
        data: {
          max: 100,
          min: 0,
          thresholds: [
            { end: 69, label: 'normal', tone: 'success' },
            { end: 89, label: 'warning', start: 70, tone: 'warning' },
            { label: 'critical', start: 90, tone: 'critical' },
          ],
          tone: 'primary',
          value: 72,
        },
      });
    },
  }),
  defineStory({
    id: 'metric-bars/ascii',
    title: 'MetricBars / ASCII',
    description: 'ASCII fallback with a custom numeric range.',
    mount(parent) {
      return metricBars({
        parent,
        box: {
          top: 2,
          left: 3,
          height: 3,
          width: 56,
        },
        data: {
          barWidth: 12,
          characters: { empty: '-', filled: '#' },
          max: 20,
          metrics: [
            { label: 'Workers', value: 15 },
            { label: 'Queues', value: 12 },
          ],
          min: 10,
        },
      });
    },
  }),
  defineStory({
    id: 'progress-bar/basic',
    title: 'ProgressBar / Basic',
    description: 'Unicode progress bar with label and percentage.',
    mount(parent) {
      return progressBar({
        parent,
        box: {
          top: 2,
          left: 3,
          height: 1,
          width: 44,
        },
        data: {
          label: 'Quality',
          tone: 'success',
          value: 78,
          width: 24,
        },
      });
    },
  }),
  defineStory({
    id: 'progress-bar/ascii',
    title: 'ProgressBar / ASCII',
    description: 'ASCII fallback for terminals without Unicode block glyphs.',
    mount(parent) {
      return progressBar({
        parent,
        box: {
          top: 2,
          left: 3,
          height: 1,
          width: 44,
        },
        data: {
          characters: {
            empty: '-',
            filled: '#',
          },
          label: 'Uploaded',
          value: 45,
          width: 24,
        },
      });
    },
  }),
  defineStory({
    id: 'sparkline/downloads',
    title: 'Sparkline / Downloads',
    description: 'Time series with primary value, downsampling, and summary.',
    mount(parent) {
      return sparkline({
        parent,
        box: {
          top: 2,
          left: 3,
          height: 2,
          width: 60,
        },
        data: {
          label: 'Weekly downloads',
          summary: 'peak: 3.8M',
          tone: 'primary',
          value: '25,200,000',
          values: [
            1, 2, 3, 4, 3, 5, 6, 7, 8, 7, 6, 5, 4, 6, 7, 7, 8, 6, 5, 4, 3, 4, 5, 6, 7, 6, 5, 6, 7,
            6,
          ],
          width: 30,
        },
      });
    },
  }),
  defineStory({
    id: 'multi-sparkline/services',
    title: 'MultiSparkline / Services',
    description: 'Aligned compact series sharing one numeric domain.',
    mount(parent) {
      return multiSparkline({
        parent,
        box: {
          border: 'line',
          height: 6,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 54,
        },
        data: {
          series: [
            {
              id: 'api',
              label: 'API',
              summary: 'p95 82ms',
              values: [12, 18, 24, 31, 48, 42, 55, 82],
            },
            {
              id: 'worker',
              label: 'Worker',
              summary: 'p95 51ms',
              values: [8, 12, 15, 18, 22, 27, 31, 51],
            },
            {
              id: 'cache',
              label: 'Cache',
              summary: 'p95 19ms',
              values: [4, 5, 8, 6, 9, 12, 14, 19],
            },
          ],
          tone: 'primary',
          width: 16,
        },
      });
    },
  }),
  defineStory({
    id: 'sparkline/empty',
    title: 'Sparkline / Empty',
    description: 'Documented empty state for missing series data.',
    mount(parent) {
      return sparkline({
        parent,
        box: {
          top: 2,
          left: 3,
          height: 1,
          width: 30,
        },
        data: {
          emptyText: 'No download data',
          values: [],
          width: 20,
        },
      });
    },
  }),
  defineStory({
    id: 'key-value/server',
    title: 'KeyValue / Server',
    description: 'Cell-aligned server metadata using semantic Box colors.',
    mount(parent) {
      return keyValue({
        box: {
          border: 'line',
          height: 7,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 36,
        },
        data: {
          borderTone: 'primary',
          items: [
            { key: 'Status', value: 'Online' },
            { key: 'CPU', value: '42%' },
            { key: 'Region', value: 'Lima' },
            { key: 'Version', value: '1.2.0' },
          ],
          tone: 'foreground',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'stat/revenue',
    title: 'Stat / Revenue',
    description: 'Primary value with unit, trend, and supporting description.',
    mount(parent) {
      return stat({
        parent,
        box: {
          top: 2,
          left: 3,
          height: 3,
          width: 48,
        },
        data: {
          description: 'Compared with previous month',
          label: 'Monthly revenue',
          tone: 'success',
          trend: {
            direction: 'up',
            value: '12.5%',
          },
          value: '$84K',
        },
      });
    },
  }),
  defineStory({
    id: 'stat/compact',
    title: 'Stat / Compact',
    description: 'Inline layout with an attached percentage unit.',
    mount(parent) {
      return stat({
        parent,
        box: {
          top: 2,
          left: 3,
          height: 1,
          width: 30,
        },
        data: {
          label: 'Overall',
          layout: 'inline',
          unit: '%',
          value: 85,
        },
      });
    },
  }),
  defineStory({
    id: 'activity-feed/deploy-events',
    title: 'ActivityFeed / Deploy Events',
    description: 'Chronological event rows with semantic state markers and details.',
    mount(parent) {
      return activityFeed({
        box: {
          border: 'line',
          height: 7,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 58,
        },
        data: {
          items: [
            { detail: 'sha 3f2a91c', id: 'queued', label: 'Build queued', tone: 'info' },
            { detail: '2m 14s', id: 'passed', label: 'Tests passed', tone: 'success' },
            { detail: 'edge cache warming', id: 'deploying', label: 'Deploying', tone: 'warning' },
            { detail: 'iad1', id: 'ready', label: 'Production ready', tone: 'success' },
          ],
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'file-tree/workspace',
    title: 'FileTree / Workspace',
    description: 'File-specific tree with directory, file, and git-state markers.',
    mount(parent) {
      return fileTree({
        box: {
          border: 'line',
          height: 8,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 48,
        },
        data: {
          activeId: 'src/index.ts',
          expandedIds: new Set(['src', 'src/components']),
          nodes: [
            {
              children: [
                {
                  children: [
                    {
                      gitStatus: 'modified',
                      id: 'src/components/button.ts',
                      kind: 'file',
                      label: 'button.ts',
                    },
                    {
                      gitStatus: 'staged',
                      id: 'src/components/card.ts',
                      kind: 'file',
                      label: 'card.ts',
                    },
                  ],
                  id: 'src/components',
                  kind: 'directory',
                  label: 'components',
                },
                { gitStatus: 'untracked', id: 'src/index.ts', kind: 'file', label: 'index.ts' },
              ],
              id: 'src',
              kind: 'directory',
              label: 'src',
            },
          ],
          selectedId: 'src/index.ts',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'json-viewer/config',
    title: 'JsonViewer / Config',
    description: 'Expandable JSON data with deterministic path ids.',
    mount(parent) {
      return jsonViewer({
        box: {
          border: 'line',
          height: 8,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 52,
        },
        data: {
          expandedPaths: new Set(['$', '$.build', '$.build.env']),
          value: {
            build: {
              command: 'npm run build',
              env: { NODE_ENV: 'production', REGION: 'iad1' },
            },
            version: '1.10.0',
          },
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'inspector/request',
    title: 'Inspector / Request',
    description: 'Nested object inspection with key, type, and preview values.',
    mount(parent) {
      return inspector({
        box: {
          border: 'line',
          height: 8,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 56,
        },
        data: {
          expandedPaths: new Set(['$', '$.headers']),
          value: {
            headers: { accept: 'application/json', authorization: '***' },
            method: 'GET',
            status: 200,
          },
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'axis/latency-scale',
    title: 'Axis / Latency Scale',
    description: 'Two-line numeric axis with deterministic tick positions.',
    mount(parent) {
      return axis({
        box: {
          border: 'line',
          height: 4,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 48,
        },
        data: {
          max: 500,
          min: 0,
          tickCount: 5,
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'bullet-chart/service-slo',
    title: 'BulletChart / Service SLO',
    description: 'Actual value against target with qualitative range background.',
    mount(parent) {
      return bulletChart({
        box: {
          border: 'line',
          height: 3,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 56,
        },
        data: {
          label: 'Availability',
          ranges: [
            { end: 90, start: 0 },
            { end: 99, start: 90 },
          ],
          target: 99,
          value: 97,
          width: 24,
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'histogram/latency-distribution',
    title: 'Histogram / Latency Distribution',
    description: 'Binned numeric distribution rendered as horizontal bars.',
    mount(parent) {
      return histogram({
        box: {
          border: 'line',
          height: 8,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 56,
        },
        data: {
          barWidth: 14,
          binCount: 5,
          values: [12, 18, 22, 26, 31, 34, 38, 42, 58, 61, 74, 88, 94, 110, 144],
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'command-palette/actions',
    title: 'CommandPalette / Actions',
    description: 'Searchable command surface with active and disabled command rows.',
    mount(parent) {
      return commandPalette({
        box: {
          border: 'line',
          height: 7,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 54,
        },
        data: {
          activeId: 'deploy',
          items: [
            { description: 'Run production deploy', id: 'deploy', label: 'Deploy' },
            { description: 'Open recent logs', id: 'logs', label: 'Show logs' },
            {
              description: 'Temporarily unavailable',
              disabled: true,
              id: 'rollback',
              label: 'Rollback',
            },
          ],
          query: 'de',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'combobox/runtime',
    title: 'Combobox / Runtime',
    description: 'Search input with filtered suggestion list and selected value.',
    mount(parent) {
      return combobox({
        box: {
          border: 'line',
          height: 6,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 42,
        },
        data: {
          activeId: 'node',
          items: [
            { id: 'node', label: 'Node.js' },
            { id: 'bun', label: 'Bun' },
            { id: 'edge', label: 'Edge runtime' },
          ],
          open: true,
          query: 'n',
          value: 'node',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'keybinding-input/shortcut',
    title: 'KeybindingInput / Shortcut',
    description: 'Captured keyboard shortcut display with recording state.',
    mount(parent) {
      return keybindingInput({
        box: {
          border: 'line',
          height: 3,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 36,
        },
        data: {
          keys: ['ctrl-k', 'shift-enter'],
          recording: true,
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'text-area/multiline',
    title: 'TextArea / Multiline',
    description: 'Bounded multiline text with line numbers and cursor marker.',
    mount(parent) {
      return textArea({
        box: {
          border: 'line',
          height: 7,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 52,
        },
        data: {
          cursorLine: 1,
          lineNumbers: true,
          value: 'Deploy notes\nValidate smoke tests\nPromote release',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'autocomplete/language',
    title: 'Autocomplete / Language',
    description: 'Input row with prefix-first suggestion filtering.',
    mount(parent) {
      return autocomplete({
        box: {
          border: 'line',
          height: 6,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 42,
        },
        data: {
          activeId: 'ts',
          items: [
            { id: 'ts', label: 'TypeScript' },
            { id: 'tsx', label: 'TSX' },
            { id: 'js', label: 'JavaScript' },
          ],
          query: 't',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'quick-switcher/resources',
    title: 'QuickSwitcher / Resources',
    description: 'Search and switch views or resources with group and metadata.',
    mount(parent) {
      return quickSwitcher({
        box: {
          border: 'line',
          height: 7,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 56,
        },
        data: {
          activeId: 'logs',
          items: [
            { group: 'Views', id: 'logs', label: 'Logs', meta: 'live' },
            { group: 'Views', id: 'deployments', label: 'Deployments', meta: '12' },
            { group: 'Projects', id: 'api', label: 'API', meta: 'production' },
          ],
          query: 'log',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'calendar-heatmap/activity',
    title: 'CalendarHeatmap / Activity',
    description: 'Seven-row daily activity grid with intensity characters.',
    mount(parent) {
      return calendarHeatmap({
        box: {
          border: 'line',
          height: 9,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 28,
        },
        data: {
          days: Array.from({ length: 28 }, (_, index) => ({
            date: `2026-07-${String(index + 1).padStart(2, '0')}`,
            value: (index * 3) % 9,
          })),
          max: 8,
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'link/docs',
    title: 'Link / Docs',
    description: 'Visible URL row with terminal-safe text output.',
    mount(parent) {
      return link({
        box: {
          border: 'line',
          height: 3,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 62,
        },
        data: {
          label: 'Roadmap',
          url: 'https://example.com/roadmap',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'ascii-art/logo',
    title: 'AsciiArt / Logo',
    description: 'Aligned static ASCII art with bounded crop.',
    mount(parent) {
      return asciiArt({
        box: {
          border: 'line',
          height: 6,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 30,
        },
        data: {
          align: 'center',
          art: 'BLESSED\nCOMPONENTS\n========',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'color-swatch/primary',
    title: 'ColorSwatch / Primary',
    description: 'Terminal-safe color token row that works without color.',
    mount(parent) {
      return colorSwatch({
        box: {
          border: 'line',
          height: 3,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 36,
        },
        data: {
          color: '#3b82f6',
          label: 'Primary',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'palette/theme',
    title: 'Palette / Theme',
    description: 'Bounded list of semantic color swatches.',
    mount(parent) {
      return palette({
        box: {
          border: 'line',
          height: 6,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 38,
        },
        data: {
          items: [
            { color: '#3b82f6', id: 'primary', label: 'Primary' },
            { color: '#22c55e', id: 'success', label: 'Success' },
            { color: '#ef4444', id: 'danger', label: 'Danger' },
          ],
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'clock/zoned-time',
    title: 'Clock / Zoned Time',
    description: 'Deterministic local or zoned time display.',
    mount(parent) {
      return clock({
        box: {
          border: 'line',
          height: 3,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 42,
        },
        data: {
          label: 'UTC',
          timeZone: 'UTC',
          value: '2026-07-08T12:00:00Z',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'timer/build-duration',
    title: 'Timer / Build Duration',
    description: 'Elapsed duration with paused state marker text.',
    mount(parent) {
      return timer({
        box: {
          border: 'line',
          height: 3,
          left: 3,
          padding: { left: 1, right: 1 },
          top: 2,
          width: 34,
        },
        data: {
          elapsed: 125_000,
          label: 'Build',
          paused: true,
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'date-input/release-date',
    title: 'DateInput / Release Date',
    description: 'Labeled date input preview with YYYY-MM-DD validation hint.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderDateInput({
          focused: true,
          hint: 'Window starts after freeze',
          label: 'Release date',
          value: '2026-07-09',
          width: 34,
        }),
        height: 6,
        label: 'DateInput',
        top: 1,
        width: 42,
      });
    },
  }),
  defineStory({
    id: 'time-input/deploy-window',
    title: 'TimeInput / Deploy Window',
    description: '24-hour time input preview with deterministic validation hint.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderTimeInput({
          hint: 'UTC maintenance window',
          label: 'Run at',
          value: '09:30',
          width: 32,
        }),
        height: 6,
        label: 'TimeInput',
        top: 1,
        width: 40,
      });
    },
  }),
  defineStory({
    id: 'prompt-dialog/rename-branch',
    title: 'PromptDialog / Rename Branch',
    description: 'Prompt body with value, validation text, and actions.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderPromptDialog({
          defaultValue: 'release/2026-07',
          hint: 'Use lowercase branch names',
          message: 'Branch name',
          title: 'Rename branch',
          width: 36,
        }),
        height: 8,
        label: 'PromptDialog',
        top: 1,
        width: 46,
      });
    },
  }),
  defineStory({
    id: 'tooltip/save-help',
    title: 'Tooltip / Save Help',
    description: 'Small contextual help bubble with placement metadata.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderTooltip({
          message: 'Save changes before deploy',
          placement: 'bottom',
          showPlacement: true,
          width: 28,
        }),
        height: 4,
        label: 'Tooltip',
        top: 2,
        width: 36,
      });
    },
  }),
  defineStory({
    id: 'toast-viewport/deploy-events',
    title: 'ToastViewport / Deploy Events',
    description: 'Bounded newest-first notification viewport.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderToastViewport({
          items: [
            { id: 'queued', message: 'Rollout queued', tone: 'info' },
            { id: 'workers', message: 'Workers draining', title: 'Deploy', tone: 'warning' },
            { id: 'done', message: 'API promoted', title: 'Deploy', tone: 'success' },
          ],
          limit: 3,
          width: 34,
        }),
        height: 6,
        label: 'ToastViewport',
        top: 1,
        width: 42,
      });
    },
  }),
  defineStory({
    id: 'countdown/deploy-freeze',
    title: 'Countdown / Deploy Freeze',
    description: 'Remaining duration until a scheduled target time.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderCountdown({
          endsAt: '2026-07-09T01:00:00.000Z',
          label: 'Freeze lifts',
          now: '2026-07-09T00:18:30.000Z',
        }),
        height: 3,
        label: 'Countdown',
        top: 2,
        width: 34,
      });
    },
  }),
  defineStory({
    id: 'schedule/release-plan',
    title: 'Schedule / Release Plan',
    description: 'Ordered upcoming events with status metadata.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderSchedule({
          items: [
            { id: 'deploy', label: 'Deploy', time: '2026-07-09T10:30:00.000Z' },
            {
              id: 'build',
              label: 'Build',
              status: 'running',
              time: '2026-07-09T09:00:00.000Z',
            },
            { id: 'verify', label: 'Verify', status: 'blocked', time: '2026-07-09T11:15:00.000Z' },
          ],
          locale: 'en-US',
          timeZone: 'UTC',
          width: 36,
        }),
        height: 6,
        label: 'Schedule',
        top: 1,
        width: 44,
      });
    },
  }),
  defineStory({
    id: 'code-viewer/source',
    title: 'CodeViewer / Source',
    description: 'Source preview with language header and line numbers.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderCodeViewer({
          code: 'export function deploy() {\n  return "ready";\n}',
          firstLine: 41,
          language: 'ts',
          width: 42,
        }),
        height: 7,
        label: 'CodeViewer',
        top: 1,
        width: 50,
      });
    },
  }),
  defineStory({
    id: 'diff-viewer/patch',
    title: 'DiffViewer / Patch',
    description: 'Unified diff rows with explicit add/remove markers.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderDiffViewer({
          lines: [
            { kind: 'context', text: 'status: pending' },
            { kind: 'remove', text: 'replicas: 2' },
            { kind: 'add', text: 'replicas: 3' },
          ],
          title: '@@ deploy.yaml @@',
          width: 38,
        }),
        height: 7,
        label: 'DiffViewer',
        top: 1,
        width: 46,
      });
    },
  }),
  defineStory({
    id: 'stack-trace/error',
    title: 'StackTrace / Error',
    description: 'Structured stack frames with stable frame numbering.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderStackTrace({
          error: 'TypeError: cannot read status',
          frames: [
            { column: 7, file: 'src/deploy.ts', functionName: 'readStatus', line: 12 },
            { file: 'src/app.ts', functionName: 'run', line: 44 },
          ],
          width: 48,
        }),
        height: 6,
        label: 'StackTrace',
        top: 1,
        width: 56,
      });
    },
  }),
  defineStory({
    id: 'environment-table/masked',
    title: 'EnvironmentTable / Masked',
    description: 'Aligned environment variables with secret masking.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderEnvironmentTable({
          items: [
            { name: 'NODE_ENV', value: 'production' },
            { name: 'API_TOKEN', secret: true, value: 'abc123' },
            { name: 'REGION', value: 'iad1' },
          ],
          width: 36,
        }),
        height: 6,
        label: 'EnvironmentTable',
        top: 1,
        width: 44,
      });
    },
  }),
  defineStory({
    id: 'shortcut-recorder/recent',
    title: 'ShortcutRecorder / Recent',
    description: 'Recent terminal shortcut names and sequences.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderShortcutRecorder({
          items: [{ key: 'tab' }, { key: 'C-c', sequence: '\\u0003' }],
          width: 28,
        }),
        height: 5,
        label: 'ShortcutRecorder',
        top: 1,
        width: 38,
      });
    },
  }),
  defineStory({
    id: 'event-log/render-events',
    title: 'EventLog / Render Events',
    description: 'Structured event rows with level, scope, and time labels.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderEventLog({
          items: [
            { level: 'info', message: 'mounted', scope: 'preview', time: '10:00' },
            { level: 'warn', message: 'slow render', scope: 'render', time: '10:01' },
          ],
          width: 40,
        }),
        height: 5,
        label: 'EventLog',
        top: 1,
        width: 48,
      });
    },
  }),
  defineStory({
    id: 'command-output/test-run',
    title: 'CommandOutput / Test Run',
    description: 'Read-only command status and captured output.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderCommandOutput({
          command: 'npm test',
          output: ['243 files passed', '621 assertions passed'],
          status: 'succeeded',
          width: 38,
        }),
        height: 6,
        label: 'CommandOutput',
        top: 1,
        width: 46,
      });
    },
  }),
  defineStory({
    id: 'terminal-pane/build-session',
    title: 'TerminalPane / Build Session',
    description: 'Scrollable terminal session with stream markers and status.',
    mount(parent) {
      return terminalPane({
        box: {
          border: 'line',
          height: 8,
          left: 2,
          padding: { left: 1, right: 1 },
          top: 1,
          width: 56,
        },
        data: {
          command: { args: ['run', 'build'], command: 'npm' },
          lines: [
            { stream: 'system', text: 'workspace blessed-components' },
            { stream: 'stdout', text: 'bundling entries' },
            { stream: 'stdout', text: 'emitting declarations' },
            { stream: 'stderr', text: 'warning: large bundle' },
            { stream: 'stdout', text: 'done in 2.1s' },
          ],
          status: 'running',
        },
        parent,
      });
    },
  }),
  defineStory({
    id: 'qr-code/module-matrix',
    title: 'QrCode / Module Matrix',
    description: 'Terminal cells from a supplied boolean module matrix.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderQrCode({
          matrix: [
            [true, true, true, false, true],
            [true, false, true, false, false],
            [true, true, true, false, true],
            [false, false, false, true, false],
            [true, false, true, false, true],
          ],
          off: '  ',
          on: '██',
        }),
        height: 7,
        label: 'QrCode',
        top: 1,
        width: 18,
      });
    },
  }),
  defineStory({
    id: 'split-pane/regions',
    title: 'SplitPane / Regions',
    description: 'Horizontal region allocation with stable labels.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderSplitPane({
          regions: [
            { id: 'main', size: 80 },
            { id: 'logs', size: 32 },
          ],
        }),
        height: 4,
        label: 'SplitPane',
        top: 1,
        width: 46,
      });
    },
  }),
  defineStory({
    id: 'skeleton/loading',
    title: 'Skeleton / Loading',
    description: 'Fixed placeholder rows for loading states.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderSkeleton({ label: 'Loading services', rows: 3, width: 28 }),
        height: 6,
        label: 'Skeleton',
        top: 1,
        width: 36,
      });
    },
  }),
  defineStory({
    id: 'virtual-table/window',
    title: 'VirtualTable / Window',
    description: 'Visible row window from a larger table.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderVirtualTable({
          columns: [{ key: 'name' }, { header: 'CPU', key: 'cpu' }],
          rowCount: 2,
          rows: [
            { cpu: '3%', name: 'web' },
            { cpu: '8%', name: 'api' },
            { cpu: '2%', name: 'cache' },
          ],
          start: 1,
        }),
        height: 5,
        label: 'VirtualTable',
        top: 1,
        width: 34,
      });
    },
  }),
  defineStory({
    id: 'bar-chart/services',
    title: 'BarChart / Services',
    description: 'Categorical values as horizontal bars.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderBarChart({
          items: [
            { label: 'api', value: 5 },
            { label: 'web', value: 10 },
          ],
          max: 10,
          width: 16,
        }),
        height: 5,
        label: 'BarChart',
        top: 1,
        width: 34,
      });
    },
  }),
  defineStory({
    id: 'line-chart/latency',
    title: 'LineChart / Latency',
    description: 'Sampled series rendered as compact glyph rows.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderLineChart({
          max: 7,
          min: 0,
          series: [{ label: 'cpu', values: [0, 3, 2, 7, 4, 6] }],
          width: 12,
        }),
        height: 4,
        label: 'LineChart',
        top: 1,
        width: 32,
      });
    },
  }),
  defineStory({
    id: 'heatmap/intensity',
    title: 'Heatmap / Intensity',
    description: 'Dense numeric matrix as terminal intensity cells.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderHeatmap({
          max: 4,
          min: 0,
          values: [
            [0, 1, 2, 3, 4],
            [4, 3, 2, 1, 0],
          ],
        }),
        height: 5,
        label: 'Heatmap',
        top: 1,
        width: 18,
      });
    },
  }),
  defineStory({
    id: 'context-menu/actions',
    title: 'ContextMenu / Actions',
    description: 'Anchored action rows with active and disabled state.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderContextMenu({
          activeId: 'open',
          items: [
            { id: 'open', label: 'Open', shortcut: 'Enter' },
            { disabled: true, id: 'delete', label: 'Delete' },
          ],
        }),
        height: 5,
        label: 'ContextMenu',
        top: 1,
        width: 34,
      });
    },
  }),
  defineStory({
    id: 'carousel/slides',
    title: 'Carousel / Slides',
    description: 'One active slide with position metadata.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderCarousel({
          activeIndex: 1,
          slides: [
            { content: 'First', id: 'one', label: 'One' },
            { content: ['Second', 'Details'], id: 'two', label: 'Two' },
          ],
        }),
        height: 6,
        label: 'Carousel',
        top: 1,
        width: 32,
      });
    },
  }),
  defineStory({
    id: 'file-picker/workspace',
    title: 'FilePicker / Workspace',
    description: 'Caller-provided filesystem entries.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderFilePicker({
          cwd: '/repo',
          entries: [
            { name: 'src', path: 'src', type: 'directory' },
            { name: 'README.md', path: 'README.md', type: 'file' },
          ],
          selectedPath: 'src',
        }),
        height: 6,
        label: 'FilePicker',
        top: 1,
        width: 36,
      });
    },
  }),
  defineStory({
    id: 'popover/details',
    title: 'Popover / Details',
    description: 'Anchored temporary content with side metadata.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderPopover({ content: ['owner: cli'], side: 'right', title: 'Details' }),
        height: 5,
        label: 'Popover',
        top: 1,
        width: 34,
      });
    },
  }),
  defineStory({
    id: 'test-results/suite',
    title: 'TestResults / Suite',
    description: 'Test outcome summary with failures and durations.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderTestResults({
          tests: [
            { durationMs: 4, name: 'renders', status: 'passed', suite: 'core' },
            { message: 'expected true', name: 'validates', status: 'failed' },
          ],
        }),
        height: 6,
        label: 'TestResults',
        top: 1,
        width: 50,
      });
    },
  }),
  defineStory({
    id: 'build-status/release',
    title: 'BuildStatus / Release',
    description: 'Build phases with outcome and duration.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderBuildStatus({
          build: 'release',
          phases: [
            { durationMs: 1200, name: 'test', status: 'success' },
            { name: 'publish', status: 'running' },
          ],
        }),
        height: 6,
        label: 'BuildStatus',
        top: 1,
        width: 38,
      });
    },
  }),
  defineStory({
    id: 'git-status/changes',
    title: 'GitStatus / Changes',
    description: 'Branch and changed files grouped by state.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderGitStatus({
          branch: 'main',
          files: [
            { path: 'README.md', state: 'staged' },
            { path: 'src/app.ts', state: 'modified' },
          ],
        }),
        height: 7,
        label: 'GitStatus',
        top: 1,
        width: 38,
      });
    },
  }),
  defineStory({
    id: 'commit-list/history',
    title: 'CommitList / History',
    description: 'Commit summaries with refs and author.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderCommitList({
          commits: [
            { author: 'Ada', hash: 'abcdef123456', message: 'Add renderer', refs: ['HEAD'] },
            { author: 'Lin', hash: '123456abcdef', message: 'Fix tests' },
          ],
        }),
        height: 5,
        label: 'CommitList',
        top: 1,
        width: 58,
      });
    },
  }),
  defineStory({
    id: 'dependency-tree/packages',
    title: 'DependencyTree / Packages',
    description: 'Package dependency hierarchy with problem labels.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderDependencyTree({
          roots: [
            {
              children: [{ name: 'left-pad', problem: 'deprecated', version: '1.3.0' }],
              name: 'app',
            },
          ],
        }),
        height: 5,
        label: 'DependencyTree',
        top: 1,
        width: 48,
      });
    },
  }),
  defineStory({
    id: 'aspect-ratio/panel',
    title: 'AspectRatio / Panel',
    description: 'Resolved cell dimensions for a fixed ratio.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderAspectRatio({ ratioHeight: 9, ratioWidth: 16, width: 32 }),
        height: 4,
        label: 'AspectRatio',
        top: 1,
        width: 32,
      });
    },
  }),
  defineStory({
    id: 'resizable/sidebar',
    title: 'Resizable / Sidebar',
    description: 'Bounded resizable region state.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderResizable({ label: 'sidebar', max: 40, min: 10, size: 50 }),
        height: 4,
        label: 'Resizable',
        top: 1,
        width: 44,
      });
    },
  }),
  defineStory({
    id: 'pill/release-tag',
    title: 'Pill / Release Tag',
    description: 'Compact capped label fallback.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderPill({ label: 'beta' }),
        height: 4,
        label: 'Pill',
        top: 1,
        width: 20,
      });
    },
  }),
  defineStory({
    id: 'rating/quality',
    title: 'Rating / Quality',
    description: 'Discrete score with numeric fallback.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderRating({ max: 5, value: 4 }),
        height: 4,
        label: 'Rating',
        top: 1,
        width: 24,
      });
    },
  }),
  defineStory({
    id: 'notification-center/unread',
    title: 'NotificationCenter / Unread',
    description: 'Persistent notifications and unread count.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderNotificationCenter({
          notifications: [
            { id: 'build', message: 'Build passed', tone: 'success', unread: true },
            { id: 'deploy', message: 'Deploy queued', tone: 'info' },
          ],
        }),
        height: 6,
        label: 'NotificationCenter',
        top: 1,
        width: 46,
      });
    },
  }),
  defineStory({
    id: 'tree-table/files',
    title: 'TreeTable / Files',
    description: 'Hierarchical rows plus columns.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderTreeTable({
          columns: [{ key: 'size' }],
          expandedIds: ['src'],
          rows: [
            {
              children: [{ id: 'app', label: 'app.ts', values: { size: '2 KB' } }],
              id: 'src',
              label: 'src',
              values: { size: '4 KB' },
            },
          ],
        }),
        height: 6,
        label: 'TreeTable',
        top: 1,
        width: 38,
      });
    },
  }),
  defineStory({
    id: 'process-list/services',
    title: 'ProcessList / Services',
    description: 'PID, CPU, memory, status, and command.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderProcessList({
          processes: [{ command: 'node', cpu: 7, memory: '32 MB', pid: 42, status: 'run' }],
        }),
        height: 5,
        label: 'ProcessList',
        top: 1,
        width: 52,
      });
    },
  }),
  defineStory({
    id: 'hex-viewer/bytes',
    title: 'HexViewer / Bytes',
    description: 'Byte offsets with hex and ASCII preview.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderHexViewer({ bytes: [72, 105, 10, 33, 0, 255], columns: 6 }),
        height: 4,
        label: 'HexViewer',
        top: 1,
        width: 42,
      });
    },
  }),
  defineStory({
    id: 'ansi-viewer/output',
    title: 'AnsiViewer / Output',
    description: 'ANSI output sanitized to readable text.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderAnsiViewer({ lines: ['\u001b[31merror\u001b[0m', 'next line'] }),
        height: 5,
        label: 'AnsiViewer',
        top: 1,
        width: 32,
      });
    },
  }),
  defineStory({
    id: 'stacked-bar-chart/composition',
    title: 'StackedBarChart / Composition',
    description: 'Category composition across segments.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderStackedBarChart({
          items: [
            {
              label: 'api',
              segments: [
                { label: 'ok', value: 7 },
                { label: 'err', value: 3 },
              ],
            },
          ],
          width: 18,
        }),
        height: 4,
        label: 'StackedBarChart',
        top: 1,
        width: 44,
      });
    },
  }),
  defineStory({
    id: 'area-chart/trend',
    title: 'AreaChart / Trend',
    description: 'Filled trend as sampled intensity cells.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderAreaChart({ max: 7, min: 0, values: [0, 3, 1, 7, 4, 6], width: 12 }),
        height: 4,
        label: 'AreaChart',
        top: 1,
        width: 28,
      });
    },
  }),
  defineStory({
    id: 'scatter-plot/correlation',
    title: 'ScatterPlot / Correlation',
    description: 'X/Y points on a fixed terminal grid.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderScatterPlot({
          height: 5,
          points: [
            { x: 1, y: 1 },
            { x: 3, y: 4 },
            { x: 5, y: 2 },
          ],
          width: 12,
          xDomain: { max: 6, min: 0 },
          yDomain: { max: 5, min: 0 },
        }),
        height: 8,
        label: 'ScatterPlot',
        top: 1,
        width: 22,
      });
    },
  }),
  defineStory({
    id: 'box-plot/latency',
    title: 'BoxPlot / Latency',
    description: 'Distribution summary with quartiles and median.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderBoxPlot({
          items: [
            { label: 'latency', lowerQuartile: 2, max: 8, median: 3, min: 1, upperQuartile: 5 },
          ],
          width: 16,
        }),
        height: 4,
        label: 'BoxPlot',
        top: 1,
        width: 36,
      });
    },
  }),
  defineStory({
    id: 'donut/capacity',
    title: 'Donut / Capacity',
    description: 'Part-to-whole values as text-first summary.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderDonut({
          segments: [
            { label: 'used', value: 7 },
            { label: 'free', value: 3 },
          ],
        }),
        height: 6,
        label: 'Donut',
        top: 1,
        width: 34,
      });
    },
  }),
  defineStory({
    id: 'candlestick-chart/ohlc',
    title: 'CandlestickChart / OHLC',
    description: 'Financial OHLC rows with direction.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderCandlestickChart({
          points: [{ close: 11, high: 12, label: 'D1', low: 9, open: 10 }],
        }),
        height: 4,
        label: 'CandlestickChart',
        top: 1,
        width: 48,
      });
    },
  }),
  defineStory({
    id: 'waterfall-chart/revenue',
    title: 'WaterfallChart / Revenue',
    description: 'Sequential signed contributions and running totals.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderWaterfallChart({
          start: 10,
          steps: [
            { label: 'sales', value: 5 },
            { label: 'cost', value: -3 },
          ],
        }),
        height: 5,
        label: 'WaterfallChart',
        top: 1,
        width: 34,
      });
    },
  }),
  defineStory({
    id: 'request-inspector/http',
    title: 'RequestInspector / HTTP',
    description: 'HTTP request and response metadata.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderRequestInspector({
          body: '{"ok":true}',
          headers: [{ name: 'content-type', value: 'application/json' }],
          method: 'get',
          status: 200,
          url: '/health',
        }),
        height: 7,
        label: 'RequestInspector',
        top: 1,
        width: 54,
      });
    },
  }),
  defineStory({
    id: 'query-results/users',
    title: 'QueryResults / Users',
    description: 'Database rows with execution metadata.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderQueryResults({
          columns: [{ key: 'id' }, { key: 'name' }],
          durationMs: 12,
          rows: [{ id: 1, name: 'ada' }],
        }),
        height: 6,
        label: 'QueryResults',
        top: 1,
        width: 38,
      });
    },
  }),
  defineStory({
    id: 'performance-panel/runtime',
    title: 'PerformancePanel / Runtime',
    description: 'Runtime counters for render and event loop health.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderPerformancePanel({
          eventLoopDelayMs: 2,
          fps: 60,
          memory: '42 MB',
          renderMs: 4,
        }),
        height: 6,
        label: 'PerformancePanel',
        top: 1,
        width: 36,
      });
    },
  }),
  defineStory({
    id: 'process-runner/test',
    title: 'ProcessRunner / Test',
    description: 'Command execution state and output lines.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderProcessRunner({
          command: 'npm test',
          output: ['vitest'],
          status: 'running',
        }),
        height: 5,
        label: 'ProcessRunner',
        top: 1,
        width: 34,
      });
    },
  }),
  defineStory({
    id: 'process-table/workers',
    title: 'ProcessTable / Workers',
    description: 'Multiple managed process states.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderProcessTable({
          processes: [
            { command: 'node server', name: 'api', status: 'running' },
            { command: 'node worker', exitCode: 0, name: 'worker', status: 'success' },
          ],
        }),
        height: 6,
        label: 'ProcessTable',
        top: 1,
        width: 56,
      });
    },
  }),
  defineStory({
    id: 'task-runner/build',
    title: 'TaskRunner / Build',
    description: 'Named task list with active state.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderTaskRunner({
          activeTask: 'build',
          tasks: [
            { name: 'lint', status: 'success' },
            { detail: 'tsup', name: 'build', status: 'running' },
          ],
        }),
        height: 5,
        label: 'TaskRunner',
        top: 1,
        width: 36,
      });
    },
  }),
  defineStory({
    id: 'repl/session',
    title: 'REPL / Session',
    description: 'Prompt history and current input.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderRepl({ currentInput: 'Math.', history: [{ input: '1 + 1', output: '2' }] }),
        height: 6,
        label: 'REPL',
        top: 1,
        width: 28,
      });
    },
  }),
  defineStory({
    id: 'shell-history/search',
    title: 'ShellHistory / Search',
    description: 'Searchable shell command history.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderShellHistory({
          activeId: '2',
          items: [
            { command: 'npm test', id: '1' },
            { command: 'git status', id: '2' },
          ],
          query: 'git',
        }),
        height: 5,
        label: 'ShellHistory',
        top: 1,
        width: 34,
      });
    },
  }),
  defineStory({
    id: 'markdown-viewer/readme',
    title: 'MarkdownViewer / README',
    description: 'Markdown degraded into terminal-safe text.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderMarkdownViewer({ markdown: '# Title\n**bold** and `code`' }),
        height: 5,
        label: 'MarkdownViewer',
        top: 1,
        width: 36,
      });
    },
  }),
  defineStory({
    id: 'rich-text/spans',
    title: 'RichText / Spans',
    description: 'Styled spans rendered as contiguous readable text.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderRichText({ spans: [{ text: 'Hello' }, { text: ' world', tone: 'muted' }] }),
        height: 4,
        label: 'RichText',
        top: 1,
        width: 32,
      });
    },
  }),
  defineStory({
    id: 'image/fallback',
    title: 'Image / Fallback',
    description: 'Image alt text and source fallback.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderImage({ alt: 'Logo', source: 'logo.png' }),
        height: 5,
        label: 'Image',
        top: 1,
        width: 32,
      });
    },
  }),
  defineStory({
    id: 'big-text/title',
    title: 'BigText / Title',
    description: 'Large text fallback as spaced uppercase text.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderBigText({ text: 'ok' }),
        height: 4,
        label: 'BigText',
        top: 1,
        width: 20,
      });
    },
  }),
  defineStory({
    id: 'calendar/month',
    title: 'Calendar / Month',
    description: 'Month grid with selected date.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderCalendar({ month: 7, selectedDate: '2026-07-10', year: 2026 }),
        height: 10,
        label: 'Calendar',
        top: 1,
        width: 34,
      });
    },
  }),
  defineStory({
    id: 'date-range-picker/release',
    title: 'DateRangePicker / Release',
    description: 'Bounded date interval labels.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderDateRangePicker({ end: '2026-07-10', start: '2026-07-01' }),
        height: 5,
        label: 'DateRangePicker',
        top: 1,
        width: 38,
      });
    },
  }),
  defineStory({
    id: 'gantt/build-plan',
    title: 'Gantt / Build Plan',
    description: 'Task spans on a fixed track.',
    mount(parent) {
      return renderedTextStory(parent, {
        content: renderGantt({
          max: 8,
          min: 0,
          tasks: [
            { end: 3, label: 'build', start: 1 },
            { end: 7, label: 'deploy', start: 4 },
          ],
          width: 18,
        }),
        height: 5,
        label: 'Gantt',
        top: 1,
        width: 34,
      });
    },
  }),
];
