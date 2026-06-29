import { stripBlessedTags } from '@/core/tags.js';
import { stripAnsi } from '@/core/width.js';
import { type RenderTextOptions, renderText, type TextAlign } from '../text/index.js';

/** Visual structures supported by {@link renderCode}. */
export type CodeVariant = 'bracketed' | 'plain';

/** Single-line overflow policies supported by {@link renderCode}. */
export type CodeOverflow = 'clip' | 'truncate';

/** Options accepted by {@link renderCode}. */
export interface RenderCodeOptions
  extends Omit<RenderTextOptions, 'content' | 'height' | 'overflow' | 'verticalAlign'> {
  /** Horizontal alignment applied after overflow handling. @defaultValue `'left'` */
  align?: TextAlign;

  /** Inline code content. ANSI sequences and Blessed tags are removed. */
  content: string;

  /** Single-line overflow policy. @defaultValue `'truncate'` */
  overflow?: CodeOverflow;

  /** Visual structure. @defaultValue `'bracketed'` */
  variant?: CodeVariant;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

/**
 * Renders safe inline code as one terminal line.
 *
 * `Code` is intentionally inline only. Use future block components such as
 * `Preformatted` or `CodeViewer` when preserving multiple source lines.
 */
export function renderCode({
  content,
  overflow = 'truncate',
  variant = 'bracketed',
  ...textOptions
}: RenderCodeOptions): string {
  const safeContent = plainText(content);

  if (safeContent.length === 0 || /[\r\n]/u.test(safeContent)) {
    throw new RangeError('Code content must be non-empty and fit on one line.');
  }

  return renderText({
    ...textOptions,
    content: variant === 'bracketed' ? `\`${safeContent}\`` : safeContent,
    height: 1,
    overflow,
  });
}
