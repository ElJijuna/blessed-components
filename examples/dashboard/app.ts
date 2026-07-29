/**
 * Service Dashboard
 *
 * Interactive control-plane example composed from public adapters.
 *
 * Run:
 *   npm run example:dashboard
 *   npm run example:dashboard -- --smoke
 */
import {
  activityFeed,
  box,
  keyValue,
  menuBar,
  progressBar,
  progressList,
  sparkline,
  stat,
  status,
  text,
} from '@/index.js';

import {
  completeExample,
  createExampleScreen,
  EXAMPLE_THEME,
  type ExampleHandle,
} from '../shared/example-screen.js';

const { screen, smoke } = createExampleScreen('Blessed Cloud — Operations');
const handles: ExampleHandle[] = [];
const pageDescriptions: Record<string, string> = {
  deploys: 'Release train and rollout health',
  incidents: 'Active incidents and recent recovery',
  overview: 'Global production posture',
  traffic: 'Request volume and edge saturation',
};
const header = box({
  box: {
    height: 3,
    left: 0,
    right: 0,
    style: { bg: 'blue', fg: 'white' },
    top: 0,
  },
  data: { theme: EXAMPLE_THEME },
  parent: screen,
});
const brand = text({
  box: { height: 1, left: 2, right: 30, top: 0, style: { bg: 'blue', fg: 'white' } },
  data: {
    content: '◆ BLESSED CLOUD  /  CONTROL PLANE',
  },
  parent: header.element,
});
const section = text({
  box: { height: 1, left: 2, right: 30, top: 1, style: { bg: 'blue', fg: 'white' } },
  data: {
    content: pageDescriptions.overview ?? '',
  },
  parent: header.element,
});
const health = status({
  box: { height: 1, right: 2, top: 1, width: 26, style: { bg: 'blue' } },
  data: {
    detail: '24 regions',
    label: 'All systems operational',
    theme: EXAMPLE_THEME,
    tone: 'success',
  },
  parent: header.element,
});
const navigation = menuBar({
  box: {
    height: 1,
    left: 2,
    right: 2,
    style: { bg: 'default', fg: 'white' },
    top: 3,
  },
  data: {
    defaultValue: 'overview',
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'traffic', label: 'Traffic' },
      { id: 'deploys', label: 'Deploys' },
      { id: 'incidents', label: 'Incidents' },
    ],
    onActivate(value) {
      section.setData({
        content: pageDescriptions[value] ?? pageDescriptions.overview ?? '',
      });
      screen.render();
    },
  },
  parent: screen,
});
const panel = box({
  box: {
    border: 'line',
    bottom: 2,
    label: ' Production · global ',
    left: 1,
    padding: { left: 1, right: 1 },
    right: 1,
    top: 5,
  },
  data: { borderTone: 'primary', theme: EXAMPLE_THEME },
  parent: screen,
});
const requests = stat({
  box: { border: 'line', height: 4, left: 0, label: ' Requests ', top: 0, width: '24%' },
  data: {
    description: 'per minute · all edges',
    label: 'Throughput',
    theme: EXAMPLE_THEME,
    tone: 'success',
    trend: { direction: 'up', value: '8.4%' },
    value: '24.8K',
  },
  parent: panel.element,
});
const latency = stat({
  box: { border: 'line', height: 4, left: '25%', label: ' Latency ', top: 0, width: '24%' },
  data: {
    description: 'p95 · SLO < 120ms',
    label: 'Response time',
    theme: EXAMPLE_THEME,
    tone: 'success',
    trend: { direction: 'down', value: '12ms' },
    value: '84ms',
  },
  parent: panel.element,
});
const errors = stat({
  box: { border: 'line', height: 4, left: '50%', label: ' Errors ', top: 0, width: '24%' },
  data: {
    description: '5xx · budget healthy',
    label: 'Error rate',
    theme: EXAMPLE_THEME,
    tone: 'success',
    trend: { direction: 'down', value: '0.03%' },
    value: '0.11%',
  },
  parent: panel.element,
});
const availability = stat({
  box: { border: 'line', height: 4, left: '75%', label: ' SLO ', top: 0, width: '24%' },
  data: {
    description: '30-day availability',
    label: 'Availability',
    theme: EXAMPLE_THEME,
    tone: 'success',
    value: '99.98%',
  },
  parent: panel.element,
});
const traffic = sparkline({
  box: { border: 'line', height: 4, label: ' Traffic · 60m ', left: 0, top: 5, width: '49%' },
  data: {
    label: 'Requests',
    summary: 'peak 31K · now 29.6K/min',
    theme: EXAMPLE_THEME,
    tone: 'info',
    values: [12, 15, 14, 18, 22, 19, 25, 27, 24, 31, 28, 30, 29, 27, 30, 32],
    width: 30,
  },
  parent: panel.element,
});
const services = progressList({
  box: {
    border: 'line',
    height: 4,
    label: ' Service saturation ',
    left: '51%',
    top: 5,
    width: '48%',
  },
  data: {
    items: [
      { id: 'api', label: 'API', value: 62 },
      { id: 'workers', label: 'Workers', value: 47 },
      { id: 'database', label: 'Database', value: 38 },
    ],
    theme: EXAMPLE_THEME,
    tone: 'primary',
    trackWidth: 12,
  },
  parent: panel.element,
});
const activity = activityFeed({
  box: {
    border: 'line',
    height: 5,
    label: ' Live activity ',
    left: 0,
    style: { border: { fg: 'blue' }, fg: 'white' },
    top: 10,
    width: '49%',
  },
  data: {
    items: [
      {
        detail: '24/24 pods ready',
        id: 'release',
        label: 'api@1.14.0 promoted',
        timestamp: '14:32',
        tone: 'success',
      },
      {
        detail: 'iad → fra',
        id: 'traffic',
        label: 'Traffic rebalanced',
        timestamp: '14:27',
        tone: 'info',
      },
      {
        detail: 'p95 back below 100ms',
        id: 'latency',
        label: 'Latency recovered',
        timestamp: '14:18',
        tone: 'success',
      },
    ],
  },
  parent: panel.element,
});
const release = keyValue({
  box: {
    border: 'line',
    height: 4,
    label: ' Current release ',
    left: '51%',
    top: 10,
    width: '48%',
  },
  data: {
    items: [
      { key: 'Version', value: 'api@1.14.0' },
      { key: 'Commit', value: '8f42c7a' },
      { key: 'Strategy', value: 'canary → global' },
    ],
    theme: EXAMPLE_THEME,
  },
  parent: panel.element,
});
const rollout = progressBar({
  box: { height: 1, left: '53%', top: 14, width: '45%' },
  data: {
    label: 'Global rollout',
    theme: EXAMPLE_THEME,
    tone: 'success',
    value: 82,
    width: 24,
  },
  parent: panel.element,
});
const footer = text({
  box: { bottom: 0, height: 1, left: 2, right: 2 },
  data: {
    align: 'center',
    content: '←/→ navigate · enter/click select · q quit  │  last sync 14:32:08 UTC',
    theme: EXAMPLE_THEME,
    tone: 'muted',
  },
  parent: screen,
});

handles.push(
  header,
  brand,
  section,
  health,
  navigation,
  panel,
  requests,
  latency,
  errors,
  availability,
  traffic,
  services,
  activity,
  release,
  rollout,
  footer,
);

navigation.focus();
completeExample('Dashboard', screen, handles, smoke);
