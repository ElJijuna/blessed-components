import { renderPlainLines } from '@/components/shared/text.js';

/** Options accepted by {@link renderPerformancePanel}. */
export interface RenderPerformancePanelOptions {
  /** Event-loop delay in milliseconds. */
  eventLoopDelayMs?: number;

  /** Frames per second. */
  fps?: number;

  /** Maximum rendered height. */
  height?: number;

  /** Memory usage text. */
  memory?: string;

  /** Render time in milliseconds. */
  renderMs?: number;

  /** Maximum terminal-cell width. */
  width?: number;
}

/** Renders runtime performance counters. */
export function renderPerformancePanel({
  eventLoopDelayMs,
  fps,
  height,
  memory,
  renderMs,
  width,
}: RenderPerformancePanelOptions): string {
  const lines = [
    `fps: ${fps ?? 'n/a'}`,
    `render: ${renderMs === undefined ? 'n/a' : `${renderMs}ms`}`,
    `event loop: ${eventLoopDelayMs === undefined ? 'n/a' : `${eventLoopDelayMs}ms`}`,
    `memory: ${memory ?? 'n/a'}`,
  ];

  return renderPlainLines(lines, { height, width });
}
