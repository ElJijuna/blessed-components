import { renderPlainLines } from '@/components/shared/text.js';

/** Diff line kind. */
export type DiffViewerLineKind = 'add' | 'context' | 'remove';

/** Diff line rendered by {@link renderDiffViewer}. */
export interface DiffViewerLine {
  /** Diff line kind. */
  kind: DiffViewerLineKind;

  /** Text without marker. */
  text: string;
}

/** Options accepted by {@link renderDiffViewer}. */
export interface RenderDiffViewerOptions {
  /** Diff lines to render. */
  lines: readonly DiffViewerLine[];

  /** Maximum rendered height. */
  height?: number;

  /** Optional hunk title. */
  title?: string;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

const MARKERS: Record<DiffViewerLineKind, string> = {
  add: '+',
  context: ' ',
  remove: '-',
};

/** Renders unified diff rows with deterministic text markers. */
export function renderDiffViewer({ height, lines, title, width }: RenderDiffViewerOptions): string {
  const body = lines.map((line) => `${MARKERS[line.kind]} ${line.text}`);

  return renderPlainLines(title === undefined ? body : [title, ...body], { height, width });
}
