import { renderPlainLines } from '@/components/shared/text.js';

/** Options accepted by {@link renderMarkdownViewer}. */
export interface RenderMarkdownViewerOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Markdown source. */
  markdown: string;

  /** Maximum terminal-cell width. */
  width?: number;
}

/** Renders Markdown as safe plain terminal text. */
export function renderMarkdownViewer({
  height,
  markdown,
  width,
}: RenderMarkdownViewerOptions): string {
  const lines = markdown.split(/\r?\n/u).map((line) =>
    line
      .replace(/^#{1,6}\s+/u, '')
      .replace(/\*\*([^*]+)\*\*/gu, '$1')
      .replace(/`([^`]+)`/gu, '$1'),
  );

  return renderPlainLines(lines, { height, width });
}
