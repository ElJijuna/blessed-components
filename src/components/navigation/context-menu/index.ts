import { fitPlain, renderPlainLines } from '@/components/shared/text.js';

/** Context menu action rendered by {@link renderContextMenu}. */
export interface ContextMenuItem {
  /** Whether action is unavailable. */
  disabled?: boolean;

  /** Stable action id. */
  id: string;

  /** Visible action label. */
  label: string;

  /** Optional shortcut text. */
  shortcut?: string;
}

/** Options accepted by {@link renderContextMenu}. */
export interface RenderContextMenuOptions {
  /** Currently highlighted item id. */
  activeId?: string;

  /** Maximum rendered height. */
  height?: number;

  /** Menu items in visual order. */
  items: readonly ContextMenuItem[];

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders anchored action choices with active and disabled state. */
export function renderContextMenu({
  activeId,
  height,
  items,
  width,
}: RenderContextMenuOptions): string {
  return renderPlainLines(
    items.map((item) => {
      const marker = item.disabled ? 'x' : item.id === activeId ? '>' : ' ';
      const shortcut = item.shortcut === undefined ? '' : ` ${item.shortcut}`;

      return fitPlain(`${marker} ${item.label}${shortcut}`, width);
    }),
    { height },
  );
}
