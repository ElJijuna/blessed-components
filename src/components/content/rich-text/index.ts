import { renderPlainLines } from '@/components/shared/text.js';

/** Rich text span. */
export interface RichTextSpan {
  text: string;
  tone?: 'default' | 'muted' | 'strong';
}

/** Options accepted by {@link renderRichText}. */
export interface RenderRichTextOptions {
  height?: number;
  spans: readonly RichTextSpan[];
  width?: number;
}

/** Renders styled spans as safe plain text. */
export function renderRichText({ height, spans, width }: RenderRichTextOptions): string {
  return renderPlainLines([spans.map((span) => span.text).join('')], { height, width });
}
