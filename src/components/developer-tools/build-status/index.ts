import { renderPlainLines } from '@/components/shared/text.js';

/** Build phase status. */
export type BuildPhaseStatus = 'failed' | 'pending' | 'running' | 'success';

/** Build phase row. */
export interface BuildStatusPhase {
  /** Phase duration in milliseconds. */
  durationMs?: number;

  /** Phase name. */
  name: string;

  /** Phase status. */
  status: BuildPhaseStatus;
}

/** Options accepted by {@link renderBuildStatus}. */
export interface RenderBuildStatusOptions {
  /** Build id, job name, or command. */
  build: string;

  /** Maximum rendered height. */
  height?: number;

  /** Build phases. */
  phases: readonly BuildStatusPhase[];

  /** Overall status. Defaults to last phase status. */
  status?: BuildPhaseStatus;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders build progress by phase. */
export function renderBuildStatus({
  build,
  height,
  phases,
  status = phases.at(-1)?.status ?? 'pending',
  width,
}: RenderBuildStatusOptions): string {
  const lines = [
    `${build}: ${status}`,
    ...phases.map((phase) => {
      const duration = phase.durationMs === undefined ? '' : ` ${phase.durationMs}ms`;

      return `${phase.status} ${phase.name}${duration}`;
    }),
  ];

  return renderPlainLines(lines, { height, width });
}
