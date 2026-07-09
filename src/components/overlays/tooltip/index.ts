import { renderPlainLines } from '@/components/shared/text.js';

/** Tooltip placement metadata. */
export type TooltipPlacement = 'bottom' | 'left' | 'right' | 'top';

/** Options accepted by {@link renderTooltip}. */
export interface RenderTooltipOptions {
  /** Maximum rendered height. */
  height?: number;

  /** Tooltip content. */
  message: string;

  /** Placement hint rendered as text for deterministic output. */
  placement?: TooltipPlacement;

  /** Whether to include placement marker. */
  showPlacement?: boolean;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders delayed contextual help as safe terminal text. */
export function renderTooltip({
  height,
  message,
  placement = 'top',
  showPlacement = false,
  width,
}: RenderTooltipOptions): string {
  const prefix = showPlacement ? `${placement}: ` : '';

  return renderPlainLines([`${prefix}${message}`], { height, width });
}
