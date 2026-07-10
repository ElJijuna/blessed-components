import { renderPlainLines } from '@/components/shared/text.js';

/** Options accepted by {@link renderBigText}. */
export interface RenderBigTextOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Text to display. */
  text: string;

  /** Maximum terminal-cell width. */
  width?: number;
}

/** Renders large-text fallback using spaced uppercase characters. */
export function renderBigText({ height, text, width }: RenderBigTextOptions): string {
  return renderPlainLines([text.toUpperCase().split('').join(' ')], { height, width });
}
