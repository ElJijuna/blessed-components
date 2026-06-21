import { badge, list, metricBars, progressBar, sparkline, stat, text } from '../../src/index.js';

import { defineStory, type PreviewStory } from './story.js';

export const stories: readonly PreviewStory[] = [
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
