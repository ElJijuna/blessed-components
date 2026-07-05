import { calculatePageLayout, type PageRegionLayout } from '@/components/layout/page/index.js';
import { calculateSidebarLayout } from '@/components/layout/sidebar-layout/index.js';

/** Rectangle returned for one AppShell region. */
export type AppShellRegionLayout = PageRegionLayout;

/** Options accepted by {@link calculateAppShellLayout}. */
export interface CalculateAppShellLayoutOptions {
  /** Footer height in terminal rows. @defaultValue `0` */
  footerHeight?: number;

  /** Empty rows or cells between adjacent regions. @defaultValue `0` */
  gap?: number;

  /** Header height in terminal rows. @defaultValue `1` */
  headerHeight?: number;

  /** Total available shell height in terminal rows. */
  height: number;

  /** Minimum useful content width before sidebar auto-collapse. @defaultValue `1` */
  minContentWidth?: number;

  /** Explicitly hide the sidebar. */
  sidebarCollapsed?: boolean;

  /** Hide sidebar when total shell width is below this threshold. */
  sidebarCollapseBelow?: number;

  /** Preferred sidebar width in terminal cells. @defaultValue `24` */
  sidebarWidth?: number;

  /** Total available shell width in terminal cells. */
  width: number;
}

/** Layout returned by {@link calculateAppShellLayout}. */
export interface AppShellLayout {
  /** Main content region. */
  content: AppShellRegionLayout;

  /** Footer region. Height may be zero. */
  footer: AppShellRegionLayout;

  /** Header region. Height may be zero. */
  header: AppShellRegionLayout;

  /** Overlay layer covering the full shell. */
  overlay: AppShellRegionLayout;

  /** Sidebar region. Width is zero when collapsed. */
  sidebar: AppShellRegionLayout;

  /** Whether the sidebar is collapsed explicitly or by width. */
  sidebarCollapsed: boolean;

  /** Whether the sidebar should be visible. */
  sidebarVisible: boolean;
}

/**
 * Calculates AppShell regions: header, footer, sidebar, content, and overlay.
 */
export function calculateAppShellLayout({
  footerHeight = 0,
  gap = 0,
  headerHeight = 1,
  height,
  minContentWidth = 1,
  sidebarCollapsed = false,
  sidebarCollapseBelow,
  sidebarWidth = 24,
  width,
}: CalculateAppShellLayoutOptions): AppShellLayout {
  const page = calculatePageLayout({
    footerHeight,
    gap,
    headerHeight,
    height,
    width,
  });
  const body = calculateSidebarLayout({
    collapsed: sidebarCollapsed,
    ...(sidebarCollapseBelow === undefined ? {} : { collapseBelow: sidebarCollapseBelow }),
    gap,
    height: page.body.height,
    minMainWidth: minContentWidth,
    sidebarWidth,
    width: page.body.width,
  });

  return {
    content: {
      height: body.main.height,
      width: body.main.width,
      x: page.body.x + body.main.x,
      y: page.body.y + body.main.y,
    },
    footer: page.footer,
    header: page.header,
    overlay: { height, width, x: 0, y: 0 },
    sidebar: {
      height: body.sidebar.height,
      width: body.sidebar.width,
      x: page.body.x + body.sidebar.x,
      y: page.body.y + body.sidebar.y,
    },
    sidebarCollapsed: body.collapsed,
    sidebarVisible: body.sidebarVisible,
  };
}
