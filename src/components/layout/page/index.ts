import { stripBlessedTags } from '@/core/tags.js';
import { truncateText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** Rectangle returned for one Page region. */
export interface PageRegionLayout {
  /** Region height in terminal rows. */
  height: number;

  /** Region width in terminal cells. */
  width: number;

  /** Horizontal position in terminal cells. */
  x: number;

  /** Vertical position in terminal rows. */
  y: number;
}

/** Options accepted by {@link calculatePageLayout}. */
export interface CalculatePageLayoutOptions {
  /** Empty rows between header/body/footer regions. @defaultValue `0` */
  gap?: number;

  /** Total available page height in terminal rows. */
  height: number;

  /** Footer height in terminal rows. @defaultValue `0` */
  footerHeight?: number;

  /** Header height in terminal rows. @defaultValue `1` */
  headerHeight?: number;

  /** Total available page width in terminal cells. */
  width: number;
}

/** Full layout returned by {@link calculatePageLayout}. */
export interface PageLayout {
  /** Main content region. */
  body: PageRegionLayout;

  /** Footer region. Height may be zero. */
  footer: PageRegionLayout;

  /** Header region. Height may be zero. */
  header: PageRegionLayout;
}

/** Options accepted by {@link renderPageHeader}. */
export interface RenderPageHeaderOptions {
  /** Optional right-aligned command or status text. */
  actions?: string;

  /** Text inserted between title and subtitle. @defaultValue `' - '` */
  separator?: string;

  /** Optional supporting title text. */
  subtitle?: string;

  /** Non-empty page title. */
  title: string;

  /** Available header width in terminal cells. */
  width: number;
}

function plainText(value: string): string {
  return stripAnsi(stripBlessedTags(value));
}

function validateDimension(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}

function assertOneLine(value: string, message: string): void {
  if (value.length === 0 || /[\r\n]/u.test(value)) {
    throw new RangeError(message);
  }
}

/**
 * Calculates header, body, and footer rectangles for a full-screen Page.
 */
export function calculatePageLayout({
  footerHeight = 0,
  gap = 0,
  headerHeight = 1,
  height,
  width,
}: CalculatePageLayoutOptions): PageLayout {
  validateDimension(width, 'Page width');
  validateDimension(height, 'Page height');
  validateDimension(headerHeight, 'Page header height');
  validateDimension(footerHeight, 'Page footer height');
  validateDimension(gap, 'Page gap');

  const headerGap = headerHeight > 0 ? gap : 0;
  const footerGap = footerHeight > 0 ? gap : 0;
  const bodyY = headerHeight + headerGap;
  const bodyHeight = Math.max(0, height - headerHeight - headerGap - footerGap - footerHeight);
  const footerY = bodyY + bodyHeight + footerGap;

  return {
    body: { height: bodyHeight, width, x: 0, y: bodyY },
    footer: { height: footerHeight, width, x: 0, y: footerY },
    header: { height: headerHeight, width, x: 0, y: 0 },
  };
}

/**
 * Renders one safe Page header line with optional right-aligned actions.
 */
export function renderPageHeader({
  actions,
  separator = ' - ',
  subtitle,
  title,
  width,
}: RenderPageHeaderOptions): string {
  validateDimension(width, 'Page header width');

  const normalizedTitle = plainText(title);
  const normalizedSubtitle = subtitle === undefined ? undefined : plainText(subtitle);
  const normalizedActions = actions === undefined ? undefined : plainText(actions);
  const normalizedSeparator = plainText(separator);

  assertOneLine(normalizedTitle, 'Page title must be non-empty and fit on one line.');

  if (normalizedSubtitle !== undefined && /[\r\n]/u.test(normalizedSubtitle)) {
    throw new RangeError('Page subtitle must fit on one line.');
  }

  if (normalizedActions !== undefined && /[\r\n]/u.test(normalizedActions)) {
    throw new RangeError('Page actions must fit on one line.');
  }

  const label =
    normalizedSubtitle === undefined || normalizedSubtitle.length === 0
      ? normalizedTitle
      : `${normalizedTitle}${normalizedSeparator}${normalizedSubtitle}`;

  if (normalizedActions === undefined || normalizedActions.length === 0) {
    return truncateText(label, width);
  }

  const actionsWidth = visibleWidth(normalizedActions);

  if (actionsWidth + 1 >= width) {
    return truncateText(normalizedActions, width);
  }

  const labelWidth = Math.max(0, width - actionsWidth - 1);
  const fittedLabel = truncateText(label, labelWidth);
  const spacer = ' '.repeat(Math.max(1, width - visibleWidth(fittedLabel) - actionsWidth));

  return `${fittedLabel}${spacer}${normalizedActions}`;
}
