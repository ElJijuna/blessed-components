/**
 * Service Dashboard
 *
 * Static application template demonstrating composition of public adapters.
 *
 * Run:
 *   npm run example:dashboard
 *   npm run example:dashboard -- --smoke
 */
import { box, keyValue, metricBars, progressBar, sparkline, stat, text } from '@/index.js';

import {
  completeExample,
  createExampleScreen,
  type ExampleHandle,
} from '../shared/example-screen.js';

const { screen, smoke } = createExampleScreen('blessed-components dashboard');
const handles: ExampleHandle[] = [];
const panel = box({
  box: {
    border: 'line',
    bottom: 1,
    left: 1,
    right: 1,
    top: 2,
  },
  data: { borderTone: 'primary' },
  parent: screen,
});

handles.push(
  panel,
  text({
    box: { height: 1, left: 2, right: 2, top: 0 },
    data: {
      align: 'center',
      content: 'SERVICE DASHBOARD',
      tone: 'primary',
    },
    parent: screen,
  }),
  stat({
    box: { height: 3, left: 2, top: 1, width: '28%' },
    data: {
      description: 'All regions',
      label: 'Requests',
      tone: 'success',
      trend: { direction: 'up', value: '8.4%' },
      value: '24.8K/min',
    },
    parent: panel.element,
  }),
  stat({
    box: { height: 3, left: '35%', top: 1, width: '28%' },
    data: {
      description: 'p95 latency',
      label: 'Latency',
      tone: 'warning',
      trend: { direction: 'down', value: '12ms' },
      value: '84ms',
    },
    parent: panel.element,
  }),
  stat({
    box: { height: 3, left: '68%', top: 1, width: '28%' },
    data: {
      description: 'Last 24 hours',
      label: 'Availability',
      tone: 'success',
      value: '99.98%',
    },
    parent: panel.element,
  }),
  sparkline({
    box: { height: 3, left: 2, top: 5, width: '46%' },
    data: {
      label: 'Traffic',
      summary: 'peak 31K/min',
      tone: 'info',
      values: [12, 15, 14, 18, 22, 19, 25, 27, 24, 31, 28, 30],
      width: 30,
    },
    parent: panel.element,
  }),
  metricBars({
    box: { height: 5, left: '52%', top: 5, width: '45%' },
    data: {
      barWidth: 14,
      metrics: [
        { label: 'API', value: 78 },
        { label: 'Workers', value: 63 },
        { label: 'Database', value: 41 },
      ],
      tone: 'primary',
    },
    parent: panel.element,
  }),
  keyValue({
    box: { height: 4, left: 2, top: 10, width: '46%' },
    data: {
      items: [
        { key: 'Environment', value: 'production' },
        { key: 'Region', value: 'us-east-1' },
        { key: 'Release', value: 'v1.2.0' },
      ],
    },
    parent: panel.element,
  }),
  progressBar({
    box: { height: 1, left: '52%', top: 11, width: '45%' },
    data: {
      label: 'Deploy',
      tone: 'success',
      value: 82,
      width: 18,
    },
    parent: panel.element,
  }),
  text({
    box: { bottom: 0, height: 1, left: 2, right: 2 },
    data: {
      align: 'center',
      content: 'q quit · composed only from public blessed-components adapters',
      tone: 'muted',
    },
    parent: panel.element,
  }),
);

completeExample('Dashboard', screen, handles, smoke);
