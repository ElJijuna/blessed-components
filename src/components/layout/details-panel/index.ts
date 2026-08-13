/** Rectangle allocated to one DetailsPanel region. */
export interface DetailsPanelRegion {
  height: number;
  width: number;
  x: number;
  y: number;
}

/** Responsive presentation selected by DetailsPanel. */
export type DetailsPanelMode = 'detail-only' | 'master-only' | 'side-by-side';

/** Options accepted by {@link calculateDetailsPanelLayout}. */
export interface CalculateDetailsPanelLayoutOptions {
  /** Width below which only one region is displayed. @defaultValue `60` */
  collapseBelow?: number;
  /** Empty cells between visible regions. @defaultValue `1` */
  gap?: number;
  height: number;
  /** Preferred master-list width. @defaultValue `24` */
  masterWidth?: number;
  /** Whether a detail item is currently selected. */
  selected?: boolean;
  width: number;
}

/** Responsive master-detail layout result. */
export interface DetailsPanelLayout {
  detail: DetailsPanelRegion;
  detailVisible: boolean;
  master: DetailsPanelRegion;
  masterVisible: boolean;
  mode: DetailsPanelMode;
}

function validate(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

/** Calculates responsive master and detail regions. */
export function calculateDetailsPanelLayout({
  collapseBelow = 60,
  gap = 1,
  height,
  masterWidth = 24,
  selected = false,
  width,
}: CalculateDetailsPanelLayoutOptions): DetailsPanelLayout {
  validate(width, 'DetailsPanel width');
  validate(height, 'DetailsPanel height');
  validate(gap, 'DetailsPanel gap');
  validate(masterWidth, 'DetailsPanel master width');
  validate(collapseBelow, 'DetailsPanel collapse threshold');
  const empty = { height, width: 0, x: 0, y: 0 };

  if (width < collapseBelow) {
    return selected
      ? {
          detail: { height, width, x: 0, y: 0 },
          detailVisible: true,
          master: empty,
          masterVisible: false,
          mode: 'detail-only',
        }
      : {
          detail: empty,
          detailVisible: false,
          master: { height, width, x: 0, y: 0 },
          masterVisible: true,
          mode: 'master-only',
        };
  }

  const resolvedMasterWidth = Math.min(masterWidth, width);
  const resolvedGap =
    resolvedMasterWidth > 0 && width > resolvedMasterWidth
      ? Math.min(gap, width - resolvedMasterWidth)
      : 0;
  const detailX = resolvedMasterWidth + resolvedGap;

  return {
    detail: { height, width: Math.max(0, width - detailX), x: detailX, y: 0 },
    detailVisible: true,
    master: { height, width: resolvedMasterWidth, x: 0, y: 0 },
    masterVisible: resolvedMasterWidth > 0,
    mode: 'side-by-side',
  };
}
