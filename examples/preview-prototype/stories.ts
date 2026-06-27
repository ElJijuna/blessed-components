import {
  alert,
  badge,
  box,
  button,
  cardBody,
  cardDescription,
  cardFooter,
  cardHeader,
  cardRoot,
  cardTitle,
  dialogBody,
  dialogContent,
  dialogDescription,
  dialogFooter,
  dialogRoot,
  dialogTitle,
  divider,
  emptyState,
  errorState,
  gauge,
  heading,
  helpOverlay,
  kbd,
  keyValue,
  label,
  legend,
  list,
  menu,
  metricBars,
  multiSparkline,
  mutedText,
  progressBar,
  progressList,
  progressStack,
  scrollArea,
  sparkline,
  spinner,
  stack,
  stat,
  status,
  stepIndicator,
  tabList,
  table,
  tabs,
  taskProgress,
  text,
  thresholds,
  trend,
  viewport,
} from '@/index.js';

import { defineStory, type PreviewStory } from './story.js';

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
];
