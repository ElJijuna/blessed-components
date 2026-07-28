/**
 * System Inspector
 *
 * Live example for inspecting memory pressure and top processes.
 *
 * Run:
 *   npm run example:system-inspector
 *   npm run example:system-inspector -- --smoke
 */
import { execFile } from 'node:child_process';
import os from 'node:os';
import { promisify } from 'node:util';

import {
  box,
  grid,
  metricBars,
  sparkline,
  stat,
  status,
  type TableColumn,
  table,
  text,
} from '@/index.js';

import {
  completeExample,
  createExampleScreen,
  EXAMPLE_THEME,
  type ExampleHandle,
} from '../shared/example-screen.js';

interface ProcessRow {
  command: string;
  cpu: number;
  id: string;
  memory: number;
  pid: number;
  rss: number;
}

const execFileAsync = promisify(execFile);

function percentage(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB'] as const;

  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function parseProcessRows(output: string): ProcessRow[] {
  return output
    .trim()
    .split('\n')
    .map((line) => {
      const match = /^\s*(\d+)\s+([\d.]+)\s+([\d.]+)\s+(\d+)\s+(.+?)\s*$/u.exec(line);

      if (match === null) {
        return undefined;
      }

      const [, pid, cpu, memory, rss, command] = match;
      const processId = Number(pid);

      return {
        command: command ?? '',
        cpu: Number(cpu),
        id: String(processId),
        memory: Number(memory),
        pid: processId,
        rss: Number(rss) * 1024,
      };
    })
    .filter((row): row is ProcessRow => row !== undefined)
    .sort((left, right) => right.memory - left.memory || right.cpu - left.cpu)
    .slice(0, 12);
}

async function readProcesses(): Promise<ProcessRow[]> {
  try {
    const { stdout } = await execFileAsync('ps', ['-axo', 'pid=,pcpu=,pmem=,rss=,comm='], {
      maxBuffer: 1024 * 1024,
    });

    return parseProcessRows(stdout);
  } catch {
    return [];
  }
}

const processColumns: readonly TableColumn<ProcessRow>[] = [
  { accessor: (row) => row.pid, align: 'right', header: 'PID', id: 'pid', width: 7 },
  {
    accessor: (row) => row.cpu.toFixed(1),
    align: 'right',
    header: 'CPU%',
    id: 'cpu',
    width: 6,
  },
  {
    accessor: (row) => row.memory.toFixed(1),
    align: 'right',
    header: 'MEM%',
    id: 'memory',
    width: 6,
  },
  {
    accessor: (row) => formatBytes(row.rss),
    align: 'right',
    header: 'RSS',
    id: 'rss',
    width: 9,
  },
  { accessor: (row) => row.command, header: 'Command', id: 'command' },
];
const { screen, smoke } = createExampleScreen('System Inspector — Host Telemetry');
const handles: ExampleHandle[] = [];
const memoryHistory: number[] = [];

let refreshInFlight: Promise<void> | undefined;

const header = box({
  box: { height: 3, left: 0, right: 0, style: { bg: 'blue', fg: 'white' }, top: 0 },
  data: { theme: EXAMPLE_THEME },
  parent: screen,
});
const title = text({
  box: { height: 1, left: 2, right: 28, style: { bg: 'blue', fg: 'white' }, top: 0 },
  data: {
    content: '⌘ SYSTEM INSPECTOR  /  HOST TELEMETRY',
  },
  parent: header.element,
});
const subtitle = text({
  box: { height: 1, left: 2, right: 28, style: { bg: 'blue', fg: 'white' }, top: 1 },
  data: {
    content: `${os.hostname()} · ${os.platform()} ${os.arch()} · ${os.cpus().length} logical cores`,
  },
  parent: header.element,
});
const live = status({
  box: { height: 1, right: 2, style: { bg: 'blue' }, top: 1, width: 24 },
  data: {
    detail: 'initializing',
    label: 'Snapshot',
    theme: EXAMPLE_THEME,
    tone: 'info',
  },
  parent: header.element,
});
const layout = grid({
  box: {
    border: 'line',
    bottom: 2,
    label: ' Host overview ',
    left: 1,
    padding: { bottom: 1, left: 1, right: 1, top: 1 },
    right: 1,
    top: 4,
  },
  data: {
    borderTone: 'primary',
    columns: 3,
    gap: 1,
    items: [
      {},
      {},
      {},
      { column: 0, columnSpan: 2, row: 1, rowSpan: 2 },
      { column: 2, row: 1 },
      { column: 2, row: 2 },
    ],
    rows: 3,
    theme: EXAMPLE_THEME,
  },
  parent: screen,
});
const memoryStat = stat({
  box: { border: 'line', label: ' Memory pressure ' },
  data: {
    description: 'used / total',
    label: 'Memory',
    theme: EXAMPLE_THEME,
    value: '0%',
  },
  parent: layout.element,
});
const loadStat = stat({
  box: { border: 'line', label: ' Load average ' },
  data: {
    description: '1 minute',
    label: 'Load',
    theme: EXAMPLE_THEME,
    value: '0.00',
  },
  parent: layout.element,
});
const processStat = stat({
  box: { border: 'line', label: ' Process sample ' },
  data: {
    description: 'from ps snapshot',
    label: 'Processes',
    theme: EXAMPLE_THEME,
    value: '0',
  },
  parent: layout.element,
});
const processes = table<ProcessRow>({
  box: { border: 'line', label: ' Top processes · sorted by memory ' },
  data: {
    columns: processColumns,
    emptyText: 'No process snapshot available',
    rows: [],
  },
  parent: layout.element,
});
const memoryBars = metricBars({
  box: { border: 'line', label: ' Capacity ' },
  data: {
    barWidth: 14,
    metrics: [
      { label: 'Used', value: 0 },
      { label: 'Free', value: 100 },
    ],
    theme: EXAMPLE_THEME,
  },
  parent: layout.element,
});
const memoryTrend = sparkline({
  box: { border: 'line', label: ' Memory · 60s ' },
  data: {
    emptyText: 'Collecting memory samples',
    label: 'Memory history',
    theme: EXAMPLE_THEME,
    values: [],
    width: 24,
  },
  parent: layout.element,
});
const footer = text({
  box: { bottom: 0, height: 1, left: 2, right: 2 },
  data: {
    align: 'center',
    content: '↑/↓ focus process · enter select · r refresh · auto 2s · q quit',
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
  layout,
  memoryStat,
  loadStat,
  processStat,
  processes,
  memoryBars,
  memoryTrend,
  footer,
);
layout.layout();

const refreshSnapshot = async (): Promise<void> => {
  live.setData({
    detail: 'reading ps + os',
    label: 'Refreshing',
    theme: EXAMPLE_THEME,
    tone: 'info',
  });
  screen.render();

  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryPercent = percentage((usedMemory / totalMemory) * 100);
  const freePercent = percentage((freeMemory / totalMemory) * 100);
  const [oneMinuteLoad = 0, fiveMinuteLoad = 0, fifteenMinuteLoad = 0] = os.loadavg();
  const rows = await readProcesses();

  memoryHistory.push(memoryPercent);

  if (memoryHistory.length > 32) {
    memoryHistory.shift();
  }

  memoryStat.setData({
    description: `${formatBytes(usedMemory)} / ${formatBytes(totalMemory)}`,
    label: 'Memory',
    theme: EXAMPLE_THEME,
    tone: memoryPercent > 85 ? 'danger' : memoryPercent > 70 ? 'warning' : 'success',
    value: `${memoryPercent}%`,
  });
  loadStat.setData({
    description: `5m ${fiveMinuteLoad.toFixed(2)} · 15m ${fifteenMinuteLoad.toFixed(2)}`,
    label: 'Load',
    theme: EXAMPLE_THEME,
    tone: oneMinuteLoad > os.cpus().length ? 'warning' : 'info',
    value: oneMinuteLoad.toFixed(2),
  });
  processStat.setData({
    description: rows.length === 0 ? 'Snapshot unavailable' : 'Top memory consumers',
    label: 'Processes',
    theme: EXAMPLE_THEME,
    tone: rows.length === 0 ? 'warning' : 'primary',
    value: String(rows.length),
  });
  processes.setData({
    columns: processColumns,
    emptyText: 'No process snapshot available',
    rows,
  });
  memoryBars.setData({
    barWidth: 14,
    metrics: [
      { label: 'Used', value: memoryPercent },
      { label: 'Free', value: freePercent },
    ],
    theme: EXAMPLE_THEME,
    tone: memoryPercent > 85 ? 'danger' : 'primary',
  });
  memoryTrend.setData({
    label: 'Memory history',
    summary: `${memoryPercent}% current`,
    theme: EXAMPLE_THEME,
    tone: memoryPercent > 85 ? 'danger' : 'success',
    values: memoryHistory,
    width: 24,
  });
  live.setData({
    detail: `${formatDuration(os.uptime())} uptime · ${new Date().toLocaleTimeString()}`,
    label: rows.length === 0 ? 'Partial' : 'Live',
    theme: EXAMPLE_THEME,
    tone: rows.length === 0 ? 'warning' : 'success',
  });

  screen.render();
};
const refresh = (): Promise<void> => {
  if (refreshInFlight !== undefined) {
    return refreshInFlight;
  }

  refreshInFlight = refreshSnapshot().finally(() => {
    refreshInFlight = undefined;
  });

  return refreshInFlight;
};

await refresh();

const timer = smoke ? undefined : setInterval(() => void refresh(), 2_000);

screen.key('r', () => {
  void refresh();
});
processes.focus();
completeExample('System inspector', screen, handles, smoke, () => {
  if (timer !== undefined) {
    clearInterval(timer);
  }
});
