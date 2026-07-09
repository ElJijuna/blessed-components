import { renderPlainLines } from '@/components/shared/text.js';

/** Recorded shortcut item. */
export interface ShortcutRecorderItem {
  /** Normalized key name. */
  key: string;

  /** Optional original terminal sequence. */
  sequence?: string;
}

/** Options accepted by {@link renderShortcutRecorder}. */
export interface RenderShortcutRecorderOptions {
  /** Empty-state text. */
  emptyLabel?: string;

  /** Maximum rendered height. */
  height?: number;

  /** Recorded shortcuts, newest last. */
  items: readonly ShortcutRecorderItem[];

  /** Title text. */
  title?: string;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders recent terminal keypress names for debugging shortcuts. */
export function renderShortcutRecorder({
  emptyLabel = 'Press a key',
  height,
  items,
  title = 'Shortcuts',
  width,
}: RenderShortcutRecorderOptions): string {
  const body =
    items.length === 0
      ? [emptyLabel]
      : items.map((item) =>
          item.sequence === undefined ? item.key : `${item.key} (${item.sequence})`,
        );

  return renderPlainLines([title, ...body], { height, width });
}
