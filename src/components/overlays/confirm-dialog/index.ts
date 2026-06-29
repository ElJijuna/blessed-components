import type { CreateDialogStateOptions } from '@/components/overlays/dialog/index.js';
import { stripBlessedTags } from '@/core/tags.js';
import { stripAnsi } from '@/core/width.js';

/** Semantic result produced by a ConfirmDialog action. */
export type ConfirmDialogResult = 'cancel' | 'confirm';

/** Options accepted by {@link normalizeConfirmDialogAction}. */
export interface NormalizeConfirmDialogActionOptions {
  /** Visible action label. */
  label: string;

  /** Semantic result represented by this action. */
  result: ConfirmDialogResult;
}

/** Stateful data shared by ConfirmDialog pure and Blessed APIs. */
export interface ConfirmDialogStateOptions extends CreateDialogStateOptions {
  /** Called when the cancel action is chosen. */
  onCancel?: () => void;

  /** Called when the confirm action is chosen. */
  onConfirm?: () => void;

  /** Called after either action is chosen. */
  onResult?: (result: ConfirmDialogResult) => void;
}

/** Safe, normalized action metadata. */
export interface ConfirmDialogActionModel {
  /** Safe one-line label. */
  label: string;

  /** Semantic result represented by this action. */
  result: ConfirmDialogResult;
}

/** Normalizes and validates one ConfirmDialog action label. */
export function normalizeConfirmDialogAction({
  label,
  result,
}: NormalizeConfirmDialogActionOptions): ConfirmDialogActionModel {
  const normalizedLabel = stripAnsi(stripBlessedTags(label)).trim();

  if (normalizedLabel.length === 0 || /[\r\n]/u.test(normalizedLabel)) {
    throw new RangeError('ConfirmDialog action label must be non-empty and fit on one line.');
  }

  return {
    label: normalizedLabel,
    result,
  };
}
