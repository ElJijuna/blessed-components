import { pad, renderPlainLines } from '@/components/shared/text.js';

/** Process row. */
export interface ProcessListItem {
  /** CPU percent. */
  cpu: number;

  /** Memory text. */
  memory: string;

  /** Process id. */
  pid: number;

  /** Process command/name. */
  command: string;

  /** Process status. */
  status?: string;
}

/** Options accepted by {@link renderProcessList}. */
export interface RenderProcessListOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Process rows. */
  processes: readonly ProcessListItem[];

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders process rows with PID, CPU, memory, status, and command. */
export function renderProcessList({ height, processes, width }: RenderProcessListOptions): string {
  const lines = [
    'PID   CPU   MEM     STATUS   COMMAND',
    ...processes.map((process) => {
      if (!Number.isFinite(process.cpu) || !Number.isInteger(process.pid)) {
        throw new RangeError('ProcessList pid must be integer and cpu must be finite.');
      }

      return [
        pad(String(process.pid), 5),
        pad(`${process.cpu}%`, 5),
        pad(process.memory, 7),
        pad(process.status ?? 'unknown', 8),
        process.command,
      ].join(' ');
    }),
  ];

  return renderPlainLines(lines, { height, width });
}
