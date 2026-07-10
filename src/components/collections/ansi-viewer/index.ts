import { renderPlainLines } from '@/components/shared/text.js';

/** Options accepted by {@link renderAnsiViewer}. */
export interface RenderAnsiViewerOptions {
  /** Maximum rendered height. */
  height?: number;

  /** ANSI or Blessed-formatted lines. */
  lines: readonly string[];

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders ANSI-formatted output after sanitizing terminal control sequences. */
export function renderAnsiViewer({ height, lines, width }: RenderAnsiViewerOptions): string {
  return renderPlainLines(lines, { height, width });
}
