/** Rectangle returned for one SidebarLayout region. */
export interface SidebarLayoutRegion {
  /** Region height in terminal rows. */
  height: number;

  /** Region width in terminal cells. */
  width: number;

  /** Horizontal position in terminal cells. */
  x: number;

  /** Vertical position in terminal rows. */
  y: number;
}

/** Options accepted by {@link calculateSidebarLayout}. */
export interface CalculateSidebarLayoutOptions {
  /** Explicitly hide the sidebar. */
  collapsed?: boolean;

  /** Hide sidebar when total width is below this threshold. */
  collapseBelow?: number;

  /** Empty cells between sidebar and main while sidebar is visible. @defaultValue `0` */
  gap?: number;

  /** Total available height in terminal rows. */
  height: number;

  /** Minimum useful main width before automatic collapse. @defaultValue `1` */
  minMainWidth?: number;

  /** Preferred sidebar width in terminal cells. @defaultValue `24` */
  sidebarWidth?: number;

  /** Total available width in terminal cells. */
  width: number;
}

/** Layout returned by {@link calculateSidebarLayout}. */
export interface SidebarLayout {
  /** Whether the sidebar is collapsed explicitly or by width. */
  collapsed: boolean;

  /** Main content region. */
  main: SidebarLayoutRegion;

  /** Sidebar region. Width is zero when collapsed. */
  sidebar: SidebarLayoutRegion;

  /** Whether the sidebar should be visible. */
  sidebarVisible: boolean;
}

function validateDimension(value: number | undefined, name: string): void {
  if (value !== undefined && (!Number.isInteger(value) || value < 0)) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

/**
 * Calculates sidebar and main rectangles with deterministic collapse rules.
 */
export function calculateSidebarLayout({
  collapsed = false,
  collapseBelow,
  gap = 0,
  height,
  minMainWidth = 1,
  sidebarWidth = 24,
  width,
}: CalculateSidebarLayoutOptions): SidebarLayout {
  validateDimension(width, 'SidebarLayout width');
  validateDimension(height, 'SidebarLayout height');
  validateDimension(gap, 'SidebarLayout gap');
  validateDimension(minMainWidth, 'SidebarLayout minimum main width');
  validateDimension(sidebarWidth, 'SidebarLayout sidebar width');
  validateDimension(collapseBelow, 'SidebarLayout collapse threshold');

  const collapsedByThreshold = collapseBelow !== undefined && width < collapseBelow;
  const availableMainWidth = Math.max(0, width - sidebarWidth - (sidebarWidth > 0 ? gap : 0));
  const resolvedCollapsed = collapsed || collapsedByThreshold || availableMainWidth < minMainWidth;

  if (resolvedCollapsed) {
    return {
      collapsed: true,
      main: { height, width, x: 0, y: 0 },
      sidebar: { height, width: 0, x: 0, y: 0 },
      sidebarVisible: false,
    };
  }

  const resolvedSidebarWidth = Math.min(sidebarWidth, width);
  const resolvedGap = resolvedSidebarWidth > 0 ? gap : 0;
  const mainX = resolvedSidebarWidth + resolvedGap;
  const mainWidth = Math.max(0, width - mainX);

  return {
    collapsed: false,
    main: { height, width: mainWidth, x: mainX, y: 0 },
    sidebar: { height, width: resolvedSidebarWidth, x: 0, y: 0 },
    sidebarVisible: resolvedSidebarWidth > 0,
  };
}
