import {
  type RenderStatusOptions,
  renderStatus,
  STATUS_ASCII_MARKERS,
  STATUS_UNICODE_MARKERS,
  type StatusMarkers,
  type StatusTone,
} from '../status/index.js';

/** Connection states supported by {@link renderConnectionStatus}. */
export type ConnectionState = 'offline' | 'online' | 'reconnecting';

/** Options accepted by {@link renderConnectionStatus}. */
export interface RenderConnectionStatusOptions
  extends Omit<RenderStatusOptions, 'detail' | 'label' | 'tone'> {
  /** Additional detail rendered after latency, when present. */
  detail?: string;

  /**
   * Current connection state.
   *
   * @defaultValue `'online'`
   */
  state?: ConnectionState;

  /**
   * Optional latency in milliseconds.
   *
   * Must be a non-negative finite number.
   */
  latency?: number;

  /** Explicit primary label. Defaults to a label derived from `state`. */
  label?: string;
}

const STATE_LABELS = {
  offline: 'Offline',
  online: 'Online',
  reconnecting: 'Reconnecting',
} as const satisfies Record<ConnectionState, string>;
const STATE_TONES = {
  offline: 'danger',
  online: 'success',
  reconnecting: 'warning',
} as const satisfies Record<ConnectionState, StatusTone>;

function formatLatency(latency: number): string {
  if (!Number.isFinite(latency) || latency < 0) {
    throw new RangeError('ConnectionStatus latency must be a non-negative finite number.');
  }

  return `${Math.round(latency)}ms`;
}

/**
 * Renders a compact connection status.
 *
 * This function is framework-independent. Import it from
 * `blessed-components/connection-status` to keep Blessed outside the module
 * graph.
 *
 * @param options - Connection state, optional latency/detail, markers, and marker visibility.
 * @returns Plain text without ANSI sequences or Blessed tags.
 *
 * @throws `RangeError`
 * Propagates validation errors from {@link renderStatus} and rejects invalid
 * latency values.
 */
export function renderConnectionStatus({
  detail,
  latency,
  label,
  state = 'online',
  ...statusOptions
}: RenderConnectionStatusOptions = {}): string {
  const latencyDetail = latency === undefined ? undefined : formatLatency(latency);
  const combinedDetail =
    latencyDetail === undefined
      ? detail
      : detail === undefined
        ? latencyDetail
        : `${latencyDetail} ${detail}`;

  return renderStatus({
    ...statusOptions,
    ...(combinedDetail === undefined ? {} : { detail: combinedDetail }),
    label: label ?? STATE_LABELS[state],
    tone: STATE_TONES[state],
  });
}

export type { StatusMarkers as ConnectionStatusMarkers };
export {
  STATUS_ASCII_MARKERS as CONNECTION_STATUS_ASCII_MARKERS,
  STATUS_UNICODE_MARKERS as CONNECTION_STATUS_UNICODE_MARKERS,
};
