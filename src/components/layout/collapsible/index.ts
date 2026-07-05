import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Character tokens used by {@link renderCollapsibleHeader}. */
export interface CollapsibleCharacters {
  /** Marker rendered when the body is collapsed. */
  collapsed: string;

  /** Marker rendered when the body is expanded. */
  expanded: string;
}

/** Options accepted by {@link renderCollapsibleHeader}. */
export interface RenderCollapsibleHeaderOptions {
  /** Character tokens for expanded and collapsed states. */
  characters?: CollapsibleCharacters;

  /** Whether toggle interaction is unavailable. */
  disabled?: boolean;

  /** Whether the body region is visible. */
  expanded?: boolean;

  /** Whether the header currently owns terminal focus. */
  focused?: boolean;

  /** Non-empty, single-line title rendered after the marker. */
  title: string;

  /** Maximum terminal-cell width of the rendered header. */
  width?: number;
}

/** Options accepted by {@link calculateCollapsibleLayout}. */
export interface CalculateCollapsibleLayoutOptions {
  /** Intrinsic body height in terminal rows. */
  bodyHeight: number;

  /** Whether the body region is visible. */
  expanded?: boolean;

  /** Empty rows between header and body while expanded. @defaultValue `0` */
  gap?: number;

  /** Header height in terminal rows. @defaultValue `1` */
  headerHeight?: number;
}

/** Positioned regions returned by {@link calculateCollapsibleLayout}. */
export interface CollapsibleLayout {
  /** Body height in terminal rows. Zero when collapsed. */
  bodyHeight: number;

  /** Body top position in terminal rows. */
  bodyTop: number;

  /** Whether the body should be visible. */
  bodyVisible: boolean;

  /** Header height in terminal rows. */
  headerHeight: number;

  /** Total visible height for the collapsed or expanded container. */
  totalHeight: number;
}

const DEFAULT_CHARACTERS: CollapsibleCharacters = {
  collapsed: '▸',
  expanded: '▾',
};

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function validateDimension(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

/**
 * Renders one Collapsible header with non-color focus and disabled cues.
 *
 * The marker communicates expanded state without relying on color.
 */
export function renderCollapsibleHeader({
  characters = DEFAULT_CHARACTERS,
  disabled = false,
  expanded = false,
  focused = false,
  title,
  width,
}: RenderCollapsibleHeaderOptions): string {
  if (width !== undefined && (!Number.isInteger(width) || width < 0)) {
    throw new RangeError('Collapsible header width must be a non-negative integer.');
  }

  const normalizedTitle = plainText(title);

  if (normalizedTitle.length === 0 || /[\r\n]/u.test(normalizedTitle)) {
    throw new RangeError('Collapsible title must be non-empty and fit on one line.');
  }

  const marker = expanded ? characters.expanded : characters.collapsed;
  const focusPrefix = focused ? '› ' : '';
  const disabledSuffix = disabled ? ' (disabled)' : '';
  const content = `${focusPrefix}${marker} ${normalizedTitle}${disabledSuffix}`;

  return width === undefined ? content : truncateText(content, width);
}

/**
 * Calculates the visible Collapsible regions without mutating terminal state.
 */
export function calculateCollapsibleLayout({
  bodyHeight,
  expanded = false,
  gap = 0,
  headerHeight = 1,
}: CalculateCollapsibleLayoutOptions): CollapsibleLayout {
  validateDimension(bodyHeight, 'Collapsible body height');
  validateDimension(gap, 'Collapsible gap');
  validateDimension(headerHeight, 'Collapsible header height');

  const bodyVisible = expanded && bodyHeight > 0;
  const resolvedGap = bodyVisible ? gap : 0;
  const visibleBodyHeight = bodyVisible ? bodyHeight : 0;

  return {
    bodyHeight: visibleBodyHeight,
    bodyTop: headerHeight + resolvedGap,
    bodyVisible,
    headerHeight,
    totalHeight: headerHeight + resolvedGap + visibleBodyHeight,
  };
}
