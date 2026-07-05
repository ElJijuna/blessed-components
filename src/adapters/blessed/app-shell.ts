import blessed from 'blessed';

import { calculateAppShellLayout } from '@/components/layout/app-shell/index.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by the AppShell root. */
export type AppShellBoxOptions = BoxElementOptions;

/** Blessed options supported by AppShell regions. */
export type AppShellRegionOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link appShell} adapter. */
export interface AppShellData extends BoxData {
  /** Main content text managed by the adapter. */
  content?: string;

  /** Initial sidebar collapsed state for uncontrolled usage. */
  defaultSidebarCollapsed?: boolean;

  /** Footer text managed by the adapter. */
  footerContent?: string;

  /** Footer height in terminal rows. @defaultValue `0` when footer is empty, otherwise `1` */
  footerHeight?: number;

  /** Empty rows or cells between adjacent regions. @defaultValue `0` */
  gap?: number;

  /** Header text managed by the adapter. */
  headerContent?: string;

  /** Header height in terminal rows. @defaultValue `1` */
  headerHeight?: number;

  /** Minimum useful content width before sidebar auto-collapse. @defaultValue `1` */
  minContentWidth?: number;

  /** Called after imperative toggling requests sidebar collapsed state changes. */
  onSidebarCollapsedChange?: (collapsed: boolean) => void;

  /** Overlay text managed by the adapter. */
  overlayContent?: string;

  /** Whether the overlay layer is visible. @defaultValue `false` */
  overlayVisible?: boolean;

  /** Controlled sidebar collapsed state. */
  sidebarCollapsed?: boolean;

  /** Hide sidebar when total shell width is below this threshold. */
  sidebarCollapseBelow?: number;

  /** Sidebar text managed by the adapter. */
  sidebarContent?: string;

  /** Preferred sidebar width in terminal cells. @defaultValue `24` */
  sidebarWidth?: number;
}

/** Options accepted by the Blessed {@link appShell} adapter. */
export interface AppShellOptions {
  /** Position, dimensions, border, padding, and standard Blessed settings. */
  box?: AppShellBoxOptions;

  /** Optional content region settings. */
  content?: AppShellRegionOptions;

  /** Shell layout, state, content, and semantic theme data. */
  data?: AppShellData;

  /** Optional footer region settings. */
  footer?: AppShellRegionOptions;

  /** Optional header region settings. */
  header?: AppShellRegionOptions;

  /** Optional overlay region settings. */
  overlay?: AppShellRegionOptions;

  /** Blessed screen or node receiving the AppShell root. */
  parent: blessed.Widgets.Node;

  /** Optional sidebar region settings. */
  sidebar?: AppShellRegionOptions;
}

/** Imperative handle returned by {@link appShell}. */
export interface AppShellHandle
  extends BlessedComponentHandle<AppShellData, blessed.Widgets.BoxElement> {
  /** Returns the current controlled or uncontrolled sidebar collapsed state. */
  collapsed(): boolean;

  /** Main content region. */
  readonly content: blessed.Widgets.BoxElement;

  /** Footer region. */
  readonly footer: blessed.Widgets.BoxElement;

  /** Header region. */
  readonly header: blessed.Widgets.BoxElement;

  /** Recalculates region positions for the current root size. */
  layout(): void;

  /** Overlay layer. */
  readonly overlay: blessed.Widgets.BoxElement;

  /** Sets sidebar collapsed state and reports whether setting occurred. */
  setCollapsed(collapsed: boolean): boolean;

  /** Sidebar region. */
  readonly sidebar: blessed.Widgets.BoxElement;

  /** Toggles sidebar collapsed state and reports whether toggling occurred. */
  toggleSidebar(): boolean;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates an AppShell container backed by Blessed boxes. */
export function appShell({
  box: rootOptions,
  content: contentOptions,
  data: initialData = {},
  footer: footerOptions,
  header: headerOptions,
  overlay: overlayOptions,
  parent,
  sidebar: sidebarOptions,
}: AppShellOptions): AppShellHandle {
  let data = initialData;
  let uncontrolledCollapsed = initialData.defaultSidebarCollapsed ?? false;

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
  const header = blessed.box({ ...headerOptions, content: '', parent: element, tags: false });
  const sidebar = blessed.box({ ...sidebarOptions, content: '', parent: element, tags: false });
  const content = blessed.box({ ...contentOptions, content: '', parent: element, tags: false });
  const footer = blessed.box({ ...footerOptions, content: '', parent: element, tags: false });
  const overlay = blessed.box({ ...overlayOptions, content: '', parent: element, tags: false });
  const style = createBoxStyleController(element, rootOptions);
  const width = (): number =>
    Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth));
  const height = (): number =>
    Math.max(0, numericDimension(element.height) - numericDimension(element.iheight));
  const isControlled = (): boolean => Object.hasOwn(data, 'sidebarCollapsed');
  const currentCollapsed = (): boolean =>
    isControlled() ? (data.sidebarCollapsed ?? false) : uncontrolledCollapsed;
  const applyRegion = (
    region: blessed.Widgets.BoxElement,
    layout: { height: number; width: number; x: number; y: number },
  ): void => {
    region.left = layout.x;
    region.top = layout.y;
    region.width = layout.width;
    region.height = layout.height;
  };
  const layout = (): void => {
    const footerHeight =
      data.footerHeight ??
      (data.footerContent === undefined || data.footerContent.length === 0 ? 0 : 1);
    const positions = calculateAppShellLayout({
      footerHeight,
      ...(data.gap === undefined ? {} : { gap: data.gap }),
      ...(data.headerHeight === undefined ? {} : { headerHeight: data.headerHeight }),
      height: height(),
      ...(data.minContentWidth === undefined ? {} : { minContentWidth: data.minContentWidth }),
      sidebarCollapsed: currentCollapsed(),
      ...(data.sidebarCollapseBelow === undefined
        ? {}
        : { sidebarCollapseBelow: data.sidebarCollapseBelow }),
      ...(data.sidebarWidth === undefined ? {} : { sidebarWidth: data.sidebarWidth }),
      width: width(),
    });

    applyRegion(header, positions.header);
    applyRegion(sidebar, positions.sidebar);
    applyRegion(content, positions.content);
    applyRegion(footer, positions.footer);
    applyRegion(overlay, positions.overlay);
    sidebar.hidden = !positions.sidebarVisible;
    footer.hidden = positions.footer.height === 0;
    overlay.hidden = data.overlayVisible !== true;
  };
  const render = (): void => {
    const {
      backgroundTone,
      borderTone,
      capabilities,
      content: contentText,
      footerContent,
      headerContent,
      overlayContent,
      sidebarContent,
      theme,
    } = data;

    style.apply({
      backgroundTone,
      borderTone,
      capabilities,
      theme,
    });
    layout();

    if (headerContent !== undefined) {
      header.setContent(headerContent);
    }

    if (sidebarContent !== undefined) {
      sidebar.setContent(sidebarContent);
    }

    if (contentText !== undefined) {
      content.setContent(contentText);
    }

    if (footerContent !== undefined) {
      footer.setContent(footerContent);
    }

    if (overlayContent !== undefined) {
      overlay.setContent(overlayContent);
    }
  };
  const setCollapsed = (collapsed: boolean): boolean => {
    if (!isControlled()) {
      uncontrolledCollapsed = collapsed;
    }

    data.onSidebarCollapsedChange?.(collapsed);
    render();

    return true;
  };

  render();
  element.on('resize', render);

  return {
    collapsed: currentCollapsed,
    content,
    destroy() {
      element.destroy();
    },
    element,
    footer,
    header,
    layout,
    overlay,
    setCollapsed,
    setData(nextData) {
      data = nextData;

      if (!isControlled() && nextData.defaultSidebarCollapsed !== undefined) {
        uncontrolledCollapsed = nextData.defaultSidebarCollapsed;
      }

      render();
    },
    sidebar,
    toggleSidebar() {
      return setCollapsed(!currentCollapsed());
    },
  };
}
