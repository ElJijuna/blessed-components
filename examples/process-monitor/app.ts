/**
 * Process Monitor
 *
 * Live example demonstrating batched updates and lifecycle cleanup.
 *
 * Run:
 *   npm run example:process-monitor
 *   npm run example:process-monitor -- --smoke
 */
import os from 'node:os';

import { keyValue, metricBars, sparkline, stat, text } from '@/index.js';

import {
  completeExample,
  createExampleScreen,
  type ExampleHandle,
} from '../shared/example-screen.js';

function percentage(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

const { screen, smoke } = createExampleScreen('blessed-components process monitor');
const handles: ExampleHandle[] = [];
const cpuHistory: number[] = [];
const title = text({
  box: { height: 1, left: 2, right: 2, top: 0 },
  data: {
    align: 'center',
    content: 'PROCESS MONITOR',
    tone: 'primary',
  },
  parent: screen,
});
const uptime = stat({
  box: { height: 2, left: 2, top: 2, width: '30%' },
  data: { label: 'Uptime', value: '0m' },
  parent: screen,
});
const load = stat({
  box: { height: 2, left: '35%', top: 2, width: '30%' },
  data: { label: 'Load average', value: '0.00' },
  parent: screen,
});
const processInfo = keyValue({
  box: { height: 4, left: '68%', top: 2, width: '30%' },
  data: {
    items: [
      { key: 'PID', value: process.pid },
      { key: 'Node', value: process.version },
      { key: 'Platform', value: process.platform },
    ],
  },
  parent: screen,
});
const resources = metricBars({
  box: { height: 4, left: 2, top: 6, width: '46%' },
  data: {
    barWidth: 18,
    metrics: [
      { label: 'CPU', value: 0 },
      { label: 'Memory', value: 0 },
    ],
  },
  parent: screen,
});
const cpuTrend = sparkline({
  box: { height: 3, left: '52%', top: 6, width: '46%' },
  data: {
    emptyText: 'Collecting samples',
    label: 'CPU history',
    values: [],
    width: 30,
  },
  parent: screen,
});
const footer = text({
  box: { bottom: 0, height: 1, left: 2, right: 2 },
  data: {
    align: 'center',
    content: 'Updates every second · q quit',
    tone: 'muted',
  },
  parent: screen,
});

handles.push(title, uptime, load, processInfo, resources, cpuTrend, footer);

const refresh = (): void => {
  const [oneMinuteLoad = 0] = os.loadavg();
  const cpuCount = Math.max(1, os.cpus().length);
  const cpu = percentage((oneMinuteLoad / cpuCount) * 100);
  const memory = percentage(((os.totalmem() - os.freemem()) / os.totalmem()) * 100);
  const uptimeMinutes = Math.floor(os.uptime() / 60);

  cpuHistory.push(cpu);

  if (cpuHistory.length > 30) {
    cpuHistory.shift();
  }

  uptime.setData({
    label: 'Uptime',
    tone: 'info',
    value: `${uptimeMinutes}m`,
  });
  load.setData({
    label: 'Load average',
    tone: cpu > 80 ? 'danger' : 'success',
    value: oneMinuteLoad.toFixed(2),
  });
  resources.setData({
    barWidth: 18,
    metrics: [
      { label: 'CPU', value: cpu },
      { label: 'Memory', value: memory },
    ],
    tone: cpu > 80 ? 'danger' : 'primary',
  });
  cpuTrend.setData({
    label: 'CPU history',
    summary: `${cpu}% current`,
    tone: cpu > 80 ? 'danger' : 'success',
    values: cpuHistory,
    width: 30,
  });
  screen.render();
};

refresh();

const timer = smoke ? undefined : setInterval(refresh, 1_000);

completeExample('Process monitor', screen, handles, smoke, () => {
  if (timer !== undefined) {
    clearInterval(timer);
  }
});
