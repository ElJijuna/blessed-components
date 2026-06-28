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
  grid,
  keyValue,
  metricBars,
  sparkline,
  stat,
  type TableColumn,
  table,
  text,
} from '@/index.js';

import {
  completeExample,
  createExampleScreen,
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
const { screen, smoke } = createExampleScreen('blessed-components system inspector');
const handles: ExampleHandle[] = [];
const memoryHistory: number[] = [];
const title = text({
  box: { height: 1, left: 2, right: 2, top: 0 },
  data: {
    align: 'center',
    content: 'SYSTEM INSPECTOR',
    tone: 'primary',
  },
  parent: screen,
});
const layout = grid({
  box: {
    border: 'line',
    bottom: 1,
    left: 1,
    padding: { bottom: 1, left: 1, right: 1, top: 1 },
    right: 1,
    top: 2,
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
  },
  parent: screen,
});
const memoryStat = stat({
  box: { border: 'line' },
  data: { description: 'Used / total', label: 'Memory', value: '0%' },
  parent: layout.element,
});
const loadStat = stat({
  box: { border: 'line' },
  data: { description: '1 minute', label: 'Load', value: '0.00' },
  parent: layout.element,
});
const processStat = stat({
  box: { border: 'line' },
  data: { description: 'From ps snapshot', label: 'Processes', value: '0' },
  parent: layout.element,
});
const processes = table<ProcessRow>({
  box: { border: 'line' },
  data: {
    columns: processColumns,
    emptyText: 'No process snapshot available',
    rows: [],
  },
  parent: layout.element,
});
const memoryBars = metricBars({
  box: { border: 'line' },
  data: {
    barWidth: 14,
    metrics: [
      { label: 'Used', value: 0 },
      { label: 'Free', value: 100 },
    ],
  },
  parent: layout.element,
});
const memoryTrend = sparkline({
  box: { border: 'line' },
  data: {
    emptyText: 'Collecting memory samples',
    label: 'Memory history',
    values: [],
    width: 24,
  },
  parent: layout.element,
});
const details = keyValue({
  box: { border: 'line' },
  data: {
    items: [
      { key: 'Host', value: os.hostname() },
      { key: 'Platform', value: `${os.platform()} ${os.arch()}` },
      { key: 'Uptime', value: formatDuration(os.uptime()) },
    ],
  },
  parent: layout.element,
});
const footer = text({
  box: { bottom: 0, height: 1, left: 2, right: 2 },
  data: {
    align: 'center',
    content: 'Updates every two seconds · sorted by memory · q quit',
    tone: 'muted',
  },
  parent: screen,
});

handles.push(
  title,
  layout,
  memoryStat,
  loadStat,
  processStat,
  processes,
  memoryBars,
  memoryTrend,
  details,
  footer,
);
layout.layout();

const refresh = async (): Promise<void> => {
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
    tone: memoryPercent > 85 ? 'danger' : memoryPercent > 70 ? 'warning' : 'success',
    value: `${memoryPercent}%`,
  });
  loadStat.setData({
    description: `5m ${fiveMinuteLoad.toFixed(2)} · 15m ${fifteenMinuteLoad.toFixed(2)}`,
    label: 'Load',
    tone: oneMinuteLoad > os.cpus().length ? 'warning' : 'info',
    value: oneMinuteLoad.toFixed(2),
  });
  processStat.setData({
    description: rows.length === 0 ? 'Snapshot unavailable' : 'Top memory consumers',
    label: 'Processes',
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
    tone: memoryPercent > 85 ? 'danger' : 'primary',
  });
  memoryTrend.setData({
    label: 'Memory history',
    summary: `${memoryPercent}% current`,
    tone: memoryPercent > 85 ? 'danger' : 'success',
    values: memoryHistory,
    width: 24,
  });
  details.setData({
    items: [
      { key: 'Host', value: os.hostname() },
      { key: 'Platform', value: `${os.platform()} ${os.arch()}` },
      { key: 'Uptime', value: formatDuration(os.uptime()) },
      { key: 'Node', value: process.version },
    ],
  });

  screen.render();
};

await refresh();

const timer = smoke ? undefined : setInterval(() => void refresh(), 2_000);

completeExample('System inspector', screen, handles, smoke, () => {
  if (timer !== undefined) {
    clearInterval(timer);
  }
});
