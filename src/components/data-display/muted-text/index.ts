import { type RenderTextOptions, renderText } from '../text/index.js';

/** Options accepted by {@link renderMutedText}. */
export interface RenderMutedTextOptions extends RenderTextOptions {
  /** Secondary text content. ANSI sequences and Blessed tags are removed. */
  content: string;
}

/**
 * Renders safe secondary text with the same layout guarantees as Text.
 *
 * This function is framework-independent. Import it from
 * `blessed-components/muted-text` to keep Blessed outside the module graph.
 *
 * @param options - Content, dimensions, overflow, and alignment.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Propagates validation errors from {@link renderText}.
 */
export function renderMutedText(options: RenderMutedTextOptions): string {
  return renderText(options);
}
