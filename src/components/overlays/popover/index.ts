import { renderPlainLines } from '@/components/shared/text.js';

/** Popover side hint. */
export type PopoverSide = 'bottom' | 'left' | 'right' | 'top';

/** Options accepted by {@link renderPopover}. */
export interface RenderPopoverOptions {
  /** Popover body lines. */
  content: readonly string[] | string;

  /** Maximum rendered height. */
  height?: number;

  /** Placement side hint. */
  side?: PopoverSide;

  /** Optional title. */
  title?: string;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders anchored temporary content as safe terminal text. */
export function renderPopover({
  content,
  height,
  side = 'bottom',
  title,
  width,
}: RenderPopoverOptions): string {
  const body = Array.isArray(content) ? content : [content];
  const heading = title === undefined ? [`popover:${side}`] : [`popover:${side} ${title}`];

  return renderPlainLines([...heading, ...body], { height, width });
}
