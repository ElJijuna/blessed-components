import blessed from 'blessed';

import { calculateSidebarLayout } from '@/components/layout/sidebar-layout/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by the SidebarLayout root. */
export type SidebarLayoutBoxOptions = BoxElementOptions;

/** Blessed options supported by SidebarLayout regions. */
export type SidebarLayoutRegionOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'parent' | 'tags'
>;

/** Stateful data accepted by the Blessed {@link sidebarLayout} adapter. */
export interface SidebarLayoutData extends BoxData {
  /** Controlled collapsed state. */
  collapsed?: boolean;

  /** Hide sidebar when total width is below this threshold. */
  collapseBelow?: number;

  /** Initial collapsed state for uncontrolled usage. */
  defaultCollapsed?: boolean;

  /** Empty cells between sidebar and main while sidebar is visible. @defaultValue `0` */
  gap?: number;

  /** Main content text managed by the adapter. */
  mainContent?: string;

  /** Minimum useful main width before automatic collapse. @defaultValue `1` */
  minMainWidth?: number;

  /** Called after imperative toggling requests collapsed state changes. */
  onCollapsedChange?: (collapsed: boolean) => void;

  /** Sidebar content text managed by the adapter. */
  sidebarContent?: string;

  /** Preferred sidebar width in terminal cells. @defaultValue `24` */
  sidebarWidth?: number;
}

/** Options accepted by the Blessed {@link sidebarLayout} adapter. */
export interface SidebarLayoutOptions {
  /** Position, dimensions, border, padding, and standard Blessed settings. */
  box?: SidebarLayoutBoxOptions;

  /** Layout, state, content, and semantic theme data. */
  data?: SidebarLayoutData;

  /** Optional main region settings. */
  main?: SidebarLayoutRegionOptions;

  /** Blessed screen or node receiving the SidebarLayout root. */
  parent: blessed.Widgets.Node;

  /** Optional sidebar region settings. */
  sidebar?: SidebarLayoutRegionOptions;
}

/** Imperative handle returned by {@link sidebarLayout}. */
export interface SidebarLayoutHandle
  extends BlessedComponentHandle<SidebarLayoutData, blessed.Widgets.BoxElement> {
  /** Returns the current controlled or uncontrolled collapsed state. */
  collapsed(): boolean;

  /** Recalculates region positions for the current root size. */
  layout(): void;

  /** Main content region where callers can append child widgets. */
  readonly main: blessed.Widgets.BoxElement;

  /** Sets collapsed state and reports whether setting occurred. */
  setCollapsed(collapsed: boolean): boolean;

  /** Sidebar region where callers can append child widgets. */
  readonly sidebar: blessed.Widgets.BoxElement;

  /** Toggles collapsed state and reports whether toggling occurred. */
  toggle(): boolean;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates a SidebarLayout container backed by Blessed boxes. */
export function sidebarLayout({
  box: rootOptions,
  data: initialData = {},
  main: mainOptions,
  parent,
  sidebar: sidebarOptions,
}: SidebarLayoutOptions): SidebarLayoutHandle {
  let data = initialData;
  let uncontrolledCollapsed = initialData.defaultCollapsed ?? false;

  const element = blessed.box({
    ...rootOptions,
    content: '',
    parent,
    style: {
      ...rootOptions?.style,
      border: { ...rootOptions?.style?.border },
    },
    tags: false,
  });
  const sidebar = blessed.box({
    ...sidebarOptions,
    content: '',
    parent: element,
    tags: false,
  });
  const main = blessed.box({
    ...mainOptions,
    content: '',
    parent: element,
    tags: false,
  });
  const style = createBoxStyleController(element, rootOptions);
  const width = (): number =>
    Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth));
  const height = (): number =>
    Math.max(0, numericDimension(element.height) - numericDimension(element.iheight));
  const isControlled = (): boolean => Object.hasOwn(data, 'collapsed');
  const currentCollapsed = (): boolean =>
    isControlled() ? (data.collapsed ?? false) : uncontrolledCollapsed;
  const layout = (): void => {
    const positions = calculateSidebarLayout({
      collapsed: currentCollapsed(),
      ...(data.collapseBelow === undefined ? {} : { collapseBelow: data.collapseBelow }),
      ...(data.gap === undefined ? {} : { gap: data.gap }),
      height: height(),
      ...(data.minMainWidth === undefined ? {} : { minMainWidth: data.minMainWidth }),
      ...(data.sidebarWidth === undefined ? {} : { sidebarWidth: data.sidebarWidth }),
      width: width(),
    });

    sidebar.left = positions.sidebar.x;
    sidebar.top = positions.sidebar.y;
    sidebar.width = positions.sidebar.width;
    sidebar.height = positions.sidebar.height;
    sidebar.hidden = !positions.sidebarVisible;
    main.left = positions.main.x;
    main.top = positions.main.y;
    main.width = positions.main.width;
    main.height = positions.main.height;
  };
  const render = (): void => {
    const { backgroundTone, borderTone, capabilities, mainContent, sidebarContent, theme } = data;

    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      theme,
    });
    layout();

    if (sidebarContent !== undefined) {
      sidebar.setContent(sidebarContent);
    }

    if (mainContent !== undefined) {
      main.setContent(mainContent);
    }
  };
  const setCollapsed = (collapsed: boolean): boolean => {
    if (!isControlled()) {
      uncontrolledCollapsed = collapsed;
    }

    data.onCollapsedChange?.(collapsed);
    render();

    return true;
  };

  render();
  element.on('resize', render);

  return {
    collapsed: currentCollapsed,
    destroy() {
      element.destroy();
    },
    element,
    layout,
    main,
    setCollapsed,
    setData(nextData) {
      data = nextData;

      if (!isControlled() && nextData.defaultCollapsed !== undefined) {
        uncontrolledCollapsed = nextData.defaultCollapsed;
      }

      render();
    },
    sidebar,
    toggle() {
      return setCollapsed(!currentCollapsed());
    },
  };
}
