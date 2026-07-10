import { pad, renderPlainLines } from '@/components/shared/text.js';

/** Process table row. */
export interface ProcessTableItem {
  command: string;
  exitCode?: number;
  name: string;
  status: 'failed' | 'running' | 'stopped' | 'success';
}

/** Options accepted by {@link renderProcessTable}. */
export interface RenderProcessTableOptions {
  height?: number;
  processes: readonly ProcessTableItem[];
  width?: number;
}

/** Renders multiple managed process states. */
export function renderProcessTable({
  height,
  processes,
  width,
}: RenderProcessTableOptions): string {
  const lines = [
    'NAME       STATUS   EXIT   COMMAND',
    ...processes.map((process) =>
      [
        pad(process.name, 10),
        pad(process.status, 8),
        pad(process.exitCode === undefined ? '-' : String(process.exitCode), 6),
        process.command,
      ].join(' '),
    ),
  ];

  return renderPlainLines(lines, { height, width });
}
