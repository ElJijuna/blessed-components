import { renderPlainLines } from '@/components/shared/text.js';

/** Command execution state. */
export type CommandOutputStatus = 'failed' | 'idle' | 'running' | 'succeeded';

/** Options accepted by {@link renderCommandOutput}. */
export interface RenderCommandOutputOptions {
  /** Command label, never executed by this renderer. */
  command: string;

  /** Exit code when command completed. */
  exitCode?: number;

  /** Maximum rendered height. */
  height?: number;

  /** Output lines. */
  output?: readonly string[];

  /** Current status. */
  status?: CommandOutputStatus;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders read-only command output and status. Does not execute processes. */
export function renderCommandOutput({
  command,
  exitCode,
  height,
  output = [],
  status = 'idle',
  width,
}: RenderCommandOutputOptions): string {
  const code = exitCode === undefined ? '' : ` (${exitCode})`;
  const lines = [`$ ${command}`, `${status}${code}`, ...output];

  return renderPlainLines(lines, { height, width });
}
