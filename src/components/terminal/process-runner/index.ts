import { renderPlainLines } from '@/components/shared/text.js';

/** Process runner status. */
export type ProcessRunnerStatus = 'failed' | 'idle' | 'running' | 'success';

/** Options accepted by {@link renderProcessRunner}. */
export interface RenderProcessRunnerOptions {
  /** Command display text. */
  command: string;

  /** Exit code when finished. */
  exitCode?: number;

  /** Maximum rendered height. */
  height?: number;

  /** Output lines. */
  output?: readonly string[];

  /** Runner status. */
  status: ProcessRunnerStatus;

  /** Maximum terminal-cell width. */
  width?: number;
}

/** Renders command execution state without spawning processes. */
export function renderProcessRunner({
  command,
  exitCode,
  height,
  output = [],
  status,
  width,
}: RenderProcessRunnerOptions): string {
  return renderPlainLines(
    [`$ ${command}`, `${status}${exitCode === undefined ? '' : ` (${exitCode})`}`, ...output],
    { height, width },
  );
}
