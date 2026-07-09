import { pad, plain, renderPlainLines } from '@/components/shared/text.js';

/** Options accepted by {@link renderCodeViewer}. */
export interface RenderCodeViewerOptions {
  /** Source code content. */
  code: string;

  /** First visible 1-based line number. */
  firstLine?: number;

  /** Maximum rendered height. */
  height?: number;

  /** Language label shown in header. */
  language?: string;

  /** Whether to render line numbers. */
  lineNumbers?: boolean;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders source code with optional language label and line numbers. */
export function renderCodeViewer({
  code,
  firstLine = 1,
  height,
  language,
  lineNumbers = true,
  width,
}: RenderCodeViewerOptions): string {
  if (!Number.isInteger(firstLine) || firstLine < 1) {
    throw new RangeError('CodeViewer firstLine must be a positive integer.');
  }

  const codeLines = plain(code).split('\n');
  const gutterWidth = String(firstLine + codeLines.length - 1).length;
  const body = codeLines.map((line, index) => {
    if (!lineNumbers) {
      return line;
    }

    return `${pad(String(firstLine + index), gutterWidth)} | ${line}`;
  });
  const lines = language === undefined ? body : [`[${language}]`, ...body];

  return renderPlainLines(lines, { height, width });
}
