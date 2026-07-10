import { renderPlainLines } from '@/components/shared/text.js';

/** Task row. */
export interface TaskRunnerTask {
  detail?: string;
  name: string;
  status: 'failed' | 'idle' | 'running' | 'success';
}

/** Options accepted by {@link renderTaskRunner}. */
export interface RenderTaskRunnerOptions {
  activeTask?: string;
  height?: number;
  tasks: readonly TaskRunnerTask[];
  width?: number;
}

/** Renders named tasks with active state. */
export function renderTaskRunner({
  activeTask,
  height,
  tasks,
  width,
}: RenderTaskRunnerOptions): string {
  return renderPlainLines(
    tasks.map((task) => {
      const marker = task.name === activeTask ? '>' : ' ';
      const detail = task.detail === undefined ? '' : ` - ${task.detail}`;

      return `${marker} ${task.status} ${task.name}${detail}`;
    }),
    { height, width },
  );
}
