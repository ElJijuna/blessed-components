import { pad, renderPlainLines } from '@/components/shared/text.js';

/** Gantt task. */
export interface GanttTask {
  end: number;
  label: string;
  start: number;
}

/** Options accepted by {@link renderGantt}. */
export interface RenderGanttOptions {
  height?: number;
  max?: number;
  min?: number;
  tasks: readonly GanttTask[];
  width: number;
}

/** Renders time-based task spans on a fixed track. */
export function renderGantt({ height, max, min, tasks, width }: RenderGanttOptions): string {
  if (!Number.isInteger(width) || width < 1) {
    throw new RangeError('Gantt width must be positive.');
  }

  const domainMin = min ?? Math.min(0, ...tasks.map((task) => task.start));
  const domainMax = max ?? Math.max(1, ...tasks.map((task) => task.end));
  const labelWidth = Math.max(0, ...tasks.map((task) => task.label.length));
  const lines = tasks.map((task) => {
    const start = Math.round(((task.start - domainMin) / (domainMax - domainMin)) * (width - 1));
    const end = Math.round(((task.end - domainMin) / (domainMax - domainMin)) * (width - 1));
    const track = Array.from({ length: width }, (_, index) =>
      index >= start && index <= end ? '#' : ' ',
    ).join('');

    return `${pad(task.label, labelWidth)} | ${track}`;
  });

  return renderPlainLines(lines, { height });
}
