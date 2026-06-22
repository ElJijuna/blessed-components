import { type RenderTextOptions, renderText } from '../../data-display/text/index.js';

/**
 * Options accepted by {@link renderCardRegion}.
 *
 * Card regions reuse Text's safe, terminal-cell-aware rendering while making
 * empty structural regions valid.
 */
export interface RenderCardRegionOptions extends Omit<RenderTextOptions, 'content'> {
  /** Dynamic region text. ANSI sequences and Blessed tags are removed. */
  content?: string;
}

/**
 * Renders safe text for one independently composable Card region.
 *
 * This renderer owns no layout or Blessed element. Region adapters provide
 * those responsibilities while callers remain free to nest arbitrary child
 * components.
 */
export function renderCardRegion({
  content = '',
  ...options
}: RenderCardRegionOptions = {}): string {
  return renderText({ ...options, content });
}
