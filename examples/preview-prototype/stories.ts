import {
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
  keyValue,
  list,
  metricBars,
  progressBar,
  scrollArea,
  sparkline,
  spinner,
  stack,
  stat,
  text,
  viewport,
} from '@/index.js';

import { defineStory, type PreviewStory } from './story.js';

export const stories: readonly PreviewStory[] = [
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
