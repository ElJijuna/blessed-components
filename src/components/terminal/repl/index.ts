import { renderPlainLines } from '@/components/shared/text.js';

/** REPL history entry. */
export interface ReplEntry {
  input: string;
  output?: string;
}

/** Options accepted by {@link renderRepl}. */
export interface RenderReplOptions {
  /** Current input. */
  currentInput?: string;

  /** Maximum rendered height. */
  height?: number;

  /** History entries. */
  history?: readonly ReplEntry[];

  /** Prompt text. */
  prompt?: string;

  /** Maximum terminal-cell width. */
  width?: number;
}

/** Renders prompt, history, and current input without evaluating code. */
export function renderRepl({
  currentInput = '',
  height,
  history = [],
  prompt = '>',
  width,
}: RenderReplOptions): string {
  const lines = [
    ...history.flatMap((entry) => [
      `${prompt} ${entry.input}`,
      ...(entry.output === undefined ? [] : [entry.output]),
    ]),
    `${prompt} ${currentInput}`,
  ];

  return renderPlainLines(lines, { height, width });
}
