import { renderPlainLines } from '@/components/shared/text.js';

/** Options accepted by {@link renderImage}. */
export interface RenderImageOptions {
  /** Alt text. */
  alt: string;

  /** Maximum rendered height. */
  height?: number;

  /** Optional source label or URL. */
  source?: string;

  /** Maximum terminal-cell width. */
  width?: number;
}

/** Renders terminal image fallback text. */
export function renderImage({ alt, height, source, width }: RenderImageOptions): string {
  return renderPlainLines(
    [`image: ${alt}`, ...(source === undefined ? [] : [`source: ${source}`])],
    {
      height,
      width,
    },
  );
}
