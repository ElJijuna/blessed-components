import { stripBlessedTags } from '@/core/tags.js';
import { truncateText, wrapText } from '@/core/truncate.js';
import { stripAnsi } from '@/core/width.js';
import {
  type RenderStatusOptions,
  renderStatus,
  STATUS_ASCII_MARKERS,
  STATUS_UNICODE_MARKERS,
  type StatusMarkers,
  type StatusTone,
} from '../status/index.js';

/** Health states supported by {@link renderHealthIndicator}. */
export type HealthState = 'degraded' | 'down' | 'healthy' | 'unknown';

/** One service included in a health summary. */
export interface HealthIndicatorService {
  /** Non-empty service label. */
  label: string;

  /** Optional reason shown when reason rendering is enabled. */
  reason?: string;

  /** Current service health state. */
  state: HealthState;
}

/** Options accepted by {@link renderHealthIndicator}. */
export interface RenderHealthIndicatorOptions
  extends Omit<RenderStatusOptions, 'detail' | 'label' | 'tone'> {
  /**
   * Maximum rendered line count.
   *
   * @defaultValue no limit
   */
  height?: number;

  /**
   * Primary summary label.
   *
   * @defaultValue `'Health'`
   */
  label?: string;

  /**
   * Maximum reason rows rendered after the summary.
   *
   * @defaultValue all reasons
   */
  maxReasons?: number;

  /** Services included in the health summary. */
  services: readonly HealthIndicatorService[];

  /**
   * Whether service reasons are rendered after the summary.
   *
   * @defaultValue `true`
   */
  showReasons?: boolean;

  /** Maximum rendered width measured in terminal cells. */
  width?: number;
}

const STATE_RANK = {
  healthy: 0,
  unknown: 1,
  degraded: 2,
  down: 3,
} as const satisfies Record<HealthState, number>;
const STATE_TONES = {
  degraded: 'warning',
  down: 'danger',
  healthy: 'success',
  unknown: 'neutral',
} as const satisfies Record<HealthState, StatusTone>;
const STATE_LABELS = {
  degraded: 'Degraded',
  down: 'Down',
  healthy: 'Healthy',
  unknown: 'Unknown',
} as const satisfies Record<HealthState, string>;

function sanitizeText(value: string): string {
  return stripBlessedTags(stripAnsi(value)).trim();
}

function aggregateState(services: readonly { state: HealthState }[]): HealthState {
  return services.reduce<HealthState>(
    (current, service) =>
      STATE_RANK[service.state] > STATE_RANK[current] ? service.state : current,
    'healthy',
  );
}

function wrapReason(value: string, width: number | undefined): string[] {
  if (width === undefined) {
    return value.split('\n');
  }

  return value
    .split('\n')
    .flatMap((line) => (line.length === 0 ? [''] : wrapText(line, width)))
    .map((line) => line.trimEnd());
}

/**
 * Renders an aggregate service health summary with optional reasons.
 *
 * This function is framework-independent. Import it from
 * `blessed-components/health-indicator` to keep Blessed outside the module
 * graph.
 *
 * @param options - Services, reason policy, markers, dimensions, and summary label.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Thrown for empty service collections, empty labels, invalid dimensions, or
 * invalid Status marker data.
 */
export function renderHealthIndicator({
  height,
  label = 'Health',
  maxReasons,
  services,
  showReasons = true,
  width,
  ...statusOptions
}: RenderHealthIndicatorOptions): string {
  if (services.length === 0) {
    throw new RangeError('HealthIndicator services must be non-empty.');
  }

  if (
    (width !== undefined && (!Number.isInteger(width) || width < 1)) ||
    (height !== undefined && (!Number.isInteger(height) || height < 0))
  ) {
    throw new RangeError(
      'HealthIndicator dimensions must be positive width and non-negative height.',
    );
  }

  if (maxReasons !== undefined && (!Number.isInteger(maxReasons) || maxReasons < 0)) {
    throw new RangeError('HealthIndicator maxReasons must be a non-negative integer.');
  }

  const safeServices = services.map((service) => {
    const safeLabel = sanitizeText(service.label);

    if (safeLabel.length === 0 || /[\r\n]/u.test(safeLabel)) {
      throw new RangeError('HealthIndicator service labels must be non-empty and fit on one line.');
    }

    const safeReason = service.reason === undefined ? undefined : sanitizeText(service.reason);

    return {
      label: safeLabel,
      ...(safeReason === undefined || safeReason.length === 0 ? {} : { reason: safeReason }),
      state: service.state,
    };
  });
  const state = aggregateState(safeServices);
  const affectedCount = safeServices.filter((service) => service.state !== 'healthy').length;
  const detail =
    affectedCount === 0
      ? `${safeServices.length}/${safeServices.length} services`
      : `${affectedCount}/${safeServices.length} affected`;
  const summary = renderStatus({
    ...statusOptions,
    detail,
    label: `${label}: ${STATE_LABELS[state]}`,
    tone: STATE_TONES[state],
  });
  const reasonRows =
    showReasons && affectedCount > 0
      ? safeServices
          .filter((service) => service.state !== 'healthy')
          .slice(0, maxReasons)
          .flatMap((service) => {
            const reason =
              service.reason === undefined
                ? `${service.label}: ${STATE_LABELS[service.state]}`
                : `${service.label}: ${service.reason}`;

            return wrapReason(`- ${reason}`, width);
          })
      : [];
  const lines = [width === undefined ? summary : truncateText(summary, width), ...reasonRows];
  const boundedLines = height === undefined ? lines : lines.slice(0, height);

  return boundedLines.join('\n');
}

export type { StatusMarkers as HealthIndicatorMarkers };
export {
  STATUS_ASCII_MARKERS as HEALTH_INDICATOR_ASCII_MARKERS,
  STATUS_UNICODE_MARKERS as HEALTH_INDICATOR_UNICODE_MARKERS,
};
