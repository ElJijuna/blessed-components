import { renderPlainLines } from '@/components/shared/text.js';

/** Stack frame rendered by {@link renderStackTrace}. */
export interface StackTraceFrame {
  /** Optional column number. */
  column?: number;

  /** File path or module id. */
  file: string;

  /** Function name. */
  functionName?: string;

  /** Optional line number. */
  line?: number;
}

/** Options accepted by {@link renderStackTrace}. */
export interface RenderStackTraceOptions {
  /** Error message heading. */
  error?: string;

  /** Stack frames in call order. */
  frames: readonly StackTraceFrame[];

  /** Maximum rendered height. */
  height?: number;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders navigable stack-trace text without parsing runtime-specific syntax. */
export function renderStackTrace({
  error,
  frames,
  height,
  width,
}: RenderStackTraceOptions): string {
  const body = frames.map((frame, index) => {
    const location =
      frame.line === undefined
        ? frame.file
        : `${frame.file}:${frame.line}${frame.column === undefined ? '' : `:${frame.column}`}`;
    const fn = frame.functionName ?? '<anonymous>';

    return `${index + 1}. ${fn} (${location})`;
  });

  return renderPlainLines(error === undefined ? body : [error, ...body], { height, width });
}
