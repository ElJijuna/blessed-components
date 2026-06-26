import { stripBlessedTags } from '@/core/tags.js';
import { truncateText, wrapText } from '@/core/truncate.js';
import { stripAnsi, visibleWidth } from '@/core/width.js';

/** State represented by one StepIndicator row. */
export type StepIndicatorState = 'active' | 'completed' | 'error' | 'pending';

/** Step marker characters used by {@link renderStepIndicator}. */
export interface StepIndicatorMarkers {
  /** Marker for the currently active step. */
  active: string;

  /** Marker for completed steps. */
  completed: string;

  /** Marker for failed steps. */
  error: string;

  /** Marker for pending steps. */
  pending: string;
}

/** Default Unicode StepIndicator markers. */
export const STEP_INDICATOR_UNICODE_MARKERS: Readonly<StepIndicatorMarkers> = Object.freeze({
  active: '●',
  completed: '✓',
  error: '×',
  pending: '○',
});

/** Default ASCII StepIndicator markers. */
export const STEP_INDICATOR_ASCII_MARKERS: Readonly<StepIndicatorMarkers> = Object.freeze({
  active: '>',
  completed: '+',
  error: 'x',
  pending: '-',
});

/** One rendered StepIndicator step. */
export interface StepIndicatorStep {
  /** Optional detail rendered after the label in vertical mode. */
  detail?: string;

  /** Stable identifier for the step. */
  id: string;

  /** Non-empty display label. */
  label: string;

  /**
   * Current state.
   *
   * @defaultValue `'pending'`
   */
  state?: StepIndicatorState;
}

/** Options accepted by {@link renderStepIndicator}. */
export interface RenderStepIndicatorOptions {
  /**
   * Separator between label and detail.
   *
   * @defaultValue `' - '`
   */
  detailSeparator?: string;

  /** Maximum rendered line count. */
  height?: number;

  /**
   * Step marker mapping.
   *
   * Every marker must be exactly one terminal cell wide.
   *
   * @defaultValue `STEP_INDICATOR_UNICODE_MARKERS`
   */
  markers?: StepIndicatorMarkers;

  /**
   * Layout orientation.
   *
   * @defaultValue `'vertical'`
   */
  orientation?: 'horizontal' | 'vertical';

  /**
   * Separator between horizontal steps.
   *
   * @defaultValue `'  '`
   */
  separator?: string;

  /**
   * Whether detail text is rendered in vertical mode.
   *
   * @defaultValue `true`
   */
  showDetail?: boolean;

  /** Ordered steps to render. */
  steps: readonly StepIndicatorStep[];

  /** Maximum rendered width measured in terminal cells. */
  width?: number;
}

function sanitizeText(value: string): string {
  return stripBlessedTags(stripAnsi(value)).trim();
}

function assertDimensions(width: number | undefined, height: number | undefined): void {
  if (
    (width !== undefined && (!Number.isInteger(width) || width < 1)) ||
    (height !== undefined && (!Number.isInteger(height) || height < 0))
  ) {
    throw new RangeError(
      'StepIndicator dimensions must be positive width and non-negative height.',
    );
  }
}

function assertMarkers(markers: StepIndicatorMarkers): void {
  if (Object.values(markers).some((value) => visibleWidth(value) !== 1)) {
    throw new RangeError('StepIndicator markers must be one terminal cell wide.');
  }
}

function wrapWords(value: string, width: number | undefined): string[] {
  if (width === undefined) {
    return value.split('\n');
  }

  return value.split('\n').flatMap((line) => {
    if (line.length === 0) {
      return [''];
    }

    const words = line.split(/\s+/u);
    const lines: string[] = [];

    let current = '';

    for (const word of words) {
      if (word.length === 0) {
        continue;
      }

      if (visibleWidth(word) > width) {
        if (current.length > 0) {
          lines.push(current);
          current = '';
        }

        lines.push(...wrapText(word, width));
        continue;
      }

      const next = current.length === 0 ? word : `${current} ${word}`;

      if (visibleWidth(next) <= width) {
        current = next;
      } else {
        lines.push(current);
        current = word;
      }
    }

    if (current.length > 0) {
      lines.push(current);
    }

    return lines;
  });
}

function renderStepLine(
  step: StepIndicatorStep,
  marker: string,
  width: number | undefined,
  detailSeparator: string,
  showDetail: boolean,
): string[] {
  const safeLabel = sanitizeText(step.label);

  if (safeLabel.length === 0) {
    throw new RangeError('StepIndicator labels must be non-empty.');
  }

  const safeDetail = step.detail === undefined ? '' : sanitizeText(step.detail);
  const content =
    showDetail && safeDetail.length > 0 ? `${safeLabel}${detailSeparator}${safeDetail}` : safeLabel;
  const prefix = `${marker} `;
  const contentWidth = width === undefined ? undefined : Math.max(1, width - visibleWidth(prefix));
  const contentLines = wrapWords(content, contentWidth);

  return contentLines.map((line, index) => (index === 0 ? `${prefix}${line}` : `  ${line}`));
}

/**
 * Renders an ordered step indicator.
 *
 * StepIndicator communicates process progress through state-specific markers
 * so it remains meaningful without color.
 */
export function renderStepIndicator({
  detailSeparator = ' - ',
  height,
  markers = STEP_INDICATOR_UNICODE_MARKERS,
  orientation = 'vertical',
  separator = '  ',
  showDetail = true,
  steps,
  width,
}: RenderStepIndicatorOptions): string {
  assertDimensions(width, height);
  assertMarkers(markers);

  if (steps.length === 0) {
    throw new RangeError('StepIndicator steps must be non-empty.');
  }

  if (orientation === 'horizontal') {
    const content = steps
      .map((step) => {
        const safeLabel = sanitizeText(step.label);

        if (safeLabel.length === 0) {
          throw new RangeError('StepIndicator labels must be non-empty.');
        }

        return `${markers[step.state ?? 'pending']} ${safeLabel}`;
      })
      .join(separator);
    const line = width === undefined ? content : truncateText(content, width);

    return height === 0 ? '' : line;
  }

  const lines = steps.flatMap((step) =>
    renderStepLine(step, markers[step.state ?? 'pending'], width, detailSeparator, showDetail),
  );
  const boundedLines = height === undefined ? lines : lines.slice(0, height);

  return boundedLines.join('\n');
}
