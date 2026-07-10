import { existsSync } from 'node:fs';
import { performance } from 'node:perf_hooks';

const distEntry = new URL('../dist/index.js', import.meta.url);

if (!existsSync(distEntry)) {
  throw new Error('Build output not found. Run `npm run build` before benchmarking.');
}

const { renderBarChart, renderLineChart, renderLogViewer, renderVirtualTable } = await import(
  distEntry
);
const rows = Array.from({ length: 10_000 }, (_, index) => ({
  cpu: `${index % 100}%`,
  id: index,
  name: `worker-${index}`,
  status: index % 3 === 0 ? 'busy' : 'idle',
}));
const logEntries = Array.from({ length: 10_000 }, (_, index) => ({
  id: String(index),
  level: index % 5 === 0 ? 'warn' : 'info',
  message: `Processed job ${index}`,
  source: 'queue',
  timestamp: index,
}));
const series = Array.from({ length: 5_000 }, (_, index) => Math.sin(index / 15) * 50 + 50);
const bars = Array.from({ length: 200 }, (_, index) => ({
  label: `svc-${index}`,
  value: (index * 13) % 100,
}));
const cases = [
  {
    iterations: 1_000,
    name: 'virtual-table-window',
    run: () =>
      renderVirtualTable({
        columns: [{ key: 'name' }, { key: 'status' }, { key: 'cpu' }],
        rowCount: 40,
        rows,
        start: 4_000,
        width: 96,
      }),
  },
  {
    iterations: 1_000,
    name: 'log-viewer-window',
    run: () =>
      renderLogViewer({
        entries: logEntries,
        height: 40,
        offset: 7_000,
        showTimestamp: true,
        width: 120,
      }),
  },
  {
    iterations: 5_000,
    name: 'line-chart-sampling',
    run: () => renderLineChart({ series: [{ label: 'cpu', values: series }], width: 120 }),
  },
  {
    iterations: 2_000,
    name: 'bar-chart-large',
    run: () => renderBarChart({ height: 30, items: bars, width: 50 }),
  },
];

console.log('renderer,iterations,totalMs,avgMs,outputChars');

for (const item of cases) {
  let output = '';

  const start = performance.now();

  for (let index = 0; index < item.iterations; index += 1) {
    output = item.run();
  }

  const totalMs = performance.now() - start;
  const avgMs = totalMs / item.iterations;

  console.log(
    [item.name, item.iterations, totalMs.toFixed(3), avgMs.toFixed(6), output.length].join(','),
  );
}
