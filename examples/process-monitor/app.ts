/**
 * Process Monitor
 *
 * Live runtime cockpit demonstrating batched updates and lifecycle cleanup.
 *
 * Run:
 *   npm run example:process-monitor
 *   npm run example:process-monitor -- --smoke
 */
import os from 'node:os';

import { box, keyValue, progressList, sparkline, stat, status, text } from '@/index.js';

import {
  completeExample,
  createExampleScreen,
  EXAMPLE_THEME,
  type ExampleHandle,
} from '../shared/example-screen.js';

function percentage(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KiB', 'MiB', 'GiB'] as const;

  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);

  return days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

const { screen, smoke } = createExampleScreen('Node Runtime — Live Monitor');
const handles: ExampleHandle[] = [];
const cpuHistory: number[] = [];
const memoryHistory: number[] = [];

let sampleCount = 0;

const header = box({
  box: { height: 3, left: 0, right: 0, style: { bg: 'blue', fg: 'white' }, top: 0 },
  data: { theme: EXAMPLE_THEME },
  parent: screen,
});
const title = text({
  box: { height: 1, left: 2, right: 28, style: { bg: 'blue', fg: 'white' }, top: 0 },
  data: { content: '◉ NODE RUNTIME  /  LIVE MONITOR' },
  parent: header.element,
});
const subtitle = text({
  box: { height: 1, left: 2, right: 28, style: { bg: 'blue', fg: 'white' }, top: 1 },
  data: { content: `${os.hostname()} · ${os.platform()} ${os.arch()} · pid ${process.pid}` },
  parent: header.element,
});
const live = status({
  box: { height: 1, right: 2, style: { bg: 'blue' }, top: 1, width: 24 },
  data: {
    detail: 'initializing',
    label: 'Live',
    theme: EXAMPLE_THEME,
    tone: 'success',
  },
  parent: header.element,
});
const panel = box({
  box: {
    border: 'line',
    bottom: 2,
    label: ' Runtime telemetry ',
    left: 1,
    padding: { left: 1, right: 1 },
    right: 1,
    top: 4,
  },
  data: { borderTone: 'primary', theme: EXAMPLE_THEME },
  parent: screen,
});
const uptime = stat({
  box: { border: 'line', height: 4, label: ' Host uptime ', left: 0, top: 0, width: '33%' },
  data: {
    description: 'since last boot',
    label: 'Uptime',
    theme: EXAMPLE_THEME,
    tone: 'info',
    value: '0m',
  },
  parent: panel.element,
});
const load = stat({
  box: { border: 'line', height: 4, label: ' Load ', left: '34%', top: 0, width: '32%' },
  data: {
    description: '1 minute average',
    label: 'Load average',
    theme: EXAMPLE_THEME,
    value: '0.00',
  },
  parent: panel.element,
});
const heap = stat({
  box: { border: 'line', height: 4, label: ' Node heap ', left: '67%', top: 0, width: '33%' },
  data: {
    description: 'used / allocated',
    label: 'Heap',
    theme: EXAMPLE_THEME,
    value: '0 MiB',
  },
  parent: panel.element,
});
const resources = progressList({
  box: { border: 'line', height: 5, label: ' Resource pressure ', left: 0, top: 5, width: '42%' },
  data: {
    items: [
      { id: 'cpu', label: 'Host CPU', value: 0 },
      { id: 'memory', label: 'Memory', value: 0 },
      { id: 'heap', label: 'Node heap', value: 0 },
    ],
    theme: EXAMPLE_THEME,
    tone: 'primary',
    trackWidth: 12,
  },
  parent: panel.element,
});
const runtime = keyValue({
  box: { border: 'line', height: 5, label: ' Runtime identity ', left: 0, top: 11, width: '42%' },
  data: {
    items: [
      { key: 'Node', value: process.version },
      { key: 'PID', value: process.pid },
      { key: 'CPU cores', value: os.cpus().length },
      { key: 'RSS', value: 'collecting' },
    ],
    theme: EXAMPLE_THEME,
  },
  parent: panel.element,
});
const cpuTrend = sparkline({
  box: { border: 'line', height: 5, label: ' CPU · last 30s ', left: '44%', top: 5, width: '56%' },
  data: {
    emptyText: 'Collecting samples',
    label: 'Host CPU estimate',
    theme: EXAMPLE_THEME,
    values: [],
    width: 36,
  },
  parent: panel.element,
});
const memoryTrend = sparkline({
  box: {
    border: 'line',
    height: 5,
    label: ' Memory · last 30s ',
    left: '44%',
    top: 11,
    width: '56%',
  },
  data: {
    emptyText: 'Collecting samples',
    label: 'System memory',
    theme: EXAMPLE_THEME,
    values: [],
    width: 36,
  },
  parent: panel.element,
});
const footer = text({
  box: { bottom: 0, height: 1, left: 2, right: 2 },
  data: {
    align: 'center',
    content: 'live sample every 1s · bounded 30-sample history · q quit',
    theme: EXAMPLE_THEME,
    tone: 'muted',
  },
  parent: screen,
});

handles.push(
  header,
  title,
  subtitle,
  live,
  panel,
  uptime,
  load,
  heap,
  resources,
  runtime,
  cpuTrend,
  memoryTrend,
  footer,
);

const refresh = (): void => {
  const [oneMinuteLoad = 0] = os.loadavg();
  const cpuCount = Math.max(1, os.cpus().length);
  const cpu = percentage((oneMinuteLoad / cpuCount) * 100);
  const totalMemory = os.totalmem();
  const memory = percentage(((totalMemory - os.freemem()) / totalMemory) * 100);
  const memoryUsage = process.memoryUsage();
  const heapPercent = percentage((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

  sampleCount += 1;
  cpuHistory.push(cpu);
  memoryHistory.push(memory);

  if (cpuHistory.length > 30) {
    cpuHistory.shift();
    memoryHistory.shift();
  }

  live.setData({
    detail: `${sampleCount} samples · ${new Date().toLocaleTimeString()}`,
    label: 'Live',
    theme: EXAMPLE_THEME,
    tone: 'success',
  });
  uptime.setData({
    description: 'since last boot',
    label: 'Uptime',
    theme: EXAMPLE_THEME,
    tone: 'info',
    value: formatUptime(os.uptime()),
  });
  load.setData({
    description: `${cpuCount} logical cores`,
    label: 'Load average',
    theme: EXAMPLE_THEME,
    tone: cpu > 80 ? 'danger' : cpu > 60 ? 'warning' : 'success',
    value: oneMinuteLoad.toFixed(2),
  });
  heap.setData({
    description: `${formatBytes(memoryUsage.heapUsed)} / ${formatBytes(memoryUsage.heapTotal)}`,
    label: 'Heap',
    theme: EXAMPLE_THEME,
    tone: memoryUsage.heapUsed / memoryUsage.heapTotal > 0.85 ? 'warning' : 'success',
    value: formatBytes(memoryUsage.heapUsed),
  });
  resources.setData({
    items: [
      { id: 'cpu', label: 'Host CPU', value: cpu },
      { id: 'memory', label: 'Memory', value: memory },
      { id: 'heap', label: 'Node heap', value: heapPercent },
    ],
    theme: EXAMPLE_THEME,
    tone: cpu > 80 || memory > 90 ? 'danger' : 'primary',
    trackWidth: 12,
  });
  runtime.setData({
    items: [
      { key: 'Node', value: process.version },
      { key: 'PID', value: process.pid },
      { key: 'CPU cores', value: cpuCount },
      { key: 'RSS', value: formatBytes(memoryUsage.rss) },
    ],
    theme: EXAMPLE_THEME,
  });
  cpuTrend.setData({
    label: 'Host CPU estimate',
    summary: `${cpu}% now · load ${oneMinuteLoad.toFixed(2)}`,
    theme: EXAMPLE_THEME,
    tone: cpu > 80 ? 'danger' : cpu > 60 ? 'warning' : 'success',
    values: cpuHistory,
    width: 36,
  });
  memoryTrend.setData({
    label: 'System memory',
    summary: `${memory}% used · ${formatBytes(os.freemem())} free`,
    theme: EXAMPLE_THEME,
    tone: memory > 90 ? 'danger' : memory > 75 ? 'warning' : 'info',
    values: memoryHistory,
    width: 36,
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
