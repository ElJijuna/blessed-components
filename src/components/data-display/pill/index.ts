import { fitPlain } from '@/components/shared/text.js';

/** Options accepted by {@link renderPill}. */
export interface RenderPillOptions {
  /** Left cap character. */
  left?: string;

  /** Maximum terminal-cell width. */
  width?: number;

  /** Pill text. */
  label: string;

  /** Right cap character. */
  right?: string;
}

/** Renders a compact rounded-label fallback using plain text caps. */
export function renderPill({ label, left = '(', right = ')', width }: RenderPillOptions): string {
  return fitPlain(`${left} ${label} ${right}`, width);
}
