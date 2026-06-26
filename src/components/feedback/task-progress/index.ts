import {
  type ProgressBarCharacters,
  type ProgressBarValueContext,
  renderProgressBar,
} from '@/components/feedback/progress-bar/index.js';
import {
  renderStepIndicator,
  STEP_INDICATOR_UNICODE_MARKERS,
  type StepIndicatorMarkers,
  type StepIndicatorStep,
} from '@/components/feedback/step-indicator/index.js';
import { stripBlessedTags } from '@/core/tags.js';
import { truncateText, wrapText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';

/** Semantic task state rendered by TaskProgress. */
export type TaskProgressStatus = 'error' | 'idle' | 'running' | 'success' | 'warning';

/** Marker characters used by {@link renderTaskProgress}. */
export interface TaskProgressMarkers {
  /** Marker for failed tasks. */
  error: string;

  /** Marker for idle tasks. */
  idle: string;

  /** Marker for running tasks. */
  running: string;

  /** Marker for completed tasks. */
  success: string;

  /** Marker for warning or degraded tasks. */
  warning: string;
}

/** Default Unicode TaskProgress markers. */
export const TASK_PROGRESS_UNICODE_MARKERS: Readonly<TaskProgressMarkers> = Object.freeze({
  error: '×',
  idle: '○',
  running: '●',
  success: '✓',
  warning: '!',
});

/** Default ASCII TaskProgress markers. */
export const TASK_PROGRESS_ASCII_MARKERS: Readonly<TaskProgressMarkers> = Object.freeze({
  error: 'x',
  idle: '-',
  running: '>',
  success: '+',
  warning: '!',
});

/** Options accepted by {@link renderTaskProgress}. */
export interface RenderTaskProgressOptions {
  /** Optional current activity text rendered under the title. */
  activity?: string;

  /** Characters used by the optional progress bar. */
  characters?: ProgressBarCharacters;

  /** Formats optional progress value text. */
  formatValue?: (context: ProgressBarValueContext) => string;

  /** Maximum rendered line count. */
  height?: number;

  /** Upper bound for the optional progress value. @defaultValue `100` */
  max?: number;

  /** Lower bound for the optional progress value. @defaultValue `0` */
  min?: number;

  /** Marker mapping for the title line. */
  markers?: TaskProgressMarkers;

  /**
   * Whether the title status marker is rendered.
   *
   * @defaultValue `true`
   */
  showMarker?: boolean;

  /**
   * Whether the optional progress bar is rendered.
   *
   * @defaultValue `true`
   */
  showProgress?: boolean;

  /** Optional steps rendered after the progress bar. */
  steps?: readonly StepIndicatorStep[];

  /** Marker mapping for optional steps. */
  stepMarkers?: StepIndicatorMarkers;

  /**
   * Semantic task status.
   *
   * @defaultValue `'running'`
   */
  status?: TaskProgressStatus;

  /** Non-empty task title. */
  title: string;

  /** Optional numeric progress value. */
  value?: number;

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
    throw new RangeError('TaskProgress dimensions must be positive width and non-negative height.');
  }
}

function assertMarkers(markers: TaskProgressMarkers): void {
  for (const marker of Object.values(markers)) {
    if (marker.length === 0) {
      throw new RangeError('TaskProgress markers must be non-empty.');
    }
  }
}

function wrapLines(value: string, width: number | undefined): string[] {
  if (width === undefined) {
    return value.split('\n');
  }

  return value
    .split('\n')
    .flatMap((line) => (line.length === 0 ? [''] : wrapText(line, width)))
    .map((line) => line.trimEnd());
}

/**
 * Renders a compact multi-step task progress summary.
 *
 * TaskProgress is display-only. It communicates current task state, optional
 * progress, and optional step state without owning timers or processes.
 */
export function renderTaskProgress({
  activity,
  characters,
  formatValue,
  height,
  max = 100,
  min = 0,
  markers = TASK_PROGRESS_UNICODE_MARKERS,
  showMarker = true,
  showProgress = true,
  steps,
  stepMarkers = STEP_INDICATOR_UNICODE_MARKERS,
  status = 'running',
  title,
  value,
  width,
}: RenderTaskProgressOptions): string {
  assertDimensions(width, height);
  assertMarkers(markers);

  const safeTitle = sanitizeText(title);

  if (safeTitle.length === 0) {
    throw new RangeError('TaskProgress title must be non-empty.');
  }

  const prefix = showMarker ? `${markers[status]} ` : '';
  const titleLine =
    width === undefined ? `${prefix}${safeTitle}` : truncateText(`${prefix}${safeTitle}`, width);
  const safeActivity = activity === undefined ? '' : sanitizeText(activity);
  const lines = [titleLine];

  if (safeActivity.length > 0) {
    lines.push(...wrapLines(safeActivity, width));
  }

  if (showProgress && value !== undefined) {
    const trackWidth = width === undefined ? 10 : Math.max(1, width - 5);

    lines.push(
      renderProgressBar({
        ...(characters === undefined ? {} : { characters }),
        ...(formatValue === undefined ? {} : { formatValue }),
        max,
        min,
        value,
        width: trackWidth,
      }),
    );
  }

  if (steps !== undefined && steps.length > 0) {
    lines.push(
      renderStepIndicator({
        markers: stepMarkers,
        steps,
        ...(width === undefined ? {} : { width }),
      }),
    );
  }

  const boundedLines = height === undefined ? lines : lines.join('\n').split('\n').slice(0, height);

  return boundedLines.join('\n');
}
