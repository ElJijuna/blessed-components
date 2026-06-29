import { describe, expect, it } from 'vitest';

import { HEALTH_INDICATOR_ASCII_MARKERS, renderHealthIndicator } from '@/index.js';

describe('HealthIndicator', () => {
  it('summarizes healthy services', () => {
    expect(
      renderHealthIndicator({
        services: [
          { label: 'API', state: 'healthy' },
          { label: 'Queue', state: 'healthy' },
        ],
      }),
    ).toBe('✓ Health: Healthy - 2/2 services');
  });

  it('renders affected service reasons by severity', () => {
    expect(
      renderHealthIndicator({
        services: [
          { label: 'API', state: 'healthy' },
          { label: 'Queue', reason: 'retry backlog', state: 'degraded' },
          { label: 'Search', reason: 'timeout', state: 'down' },
        ],
      }),
    ).toBe('× Health: Down - 2/3 affected\n- Queue: retry backlog\n- Search: timeout');
  });

  it('supports ASCII markers, custom label, hidden reasons, and width', () => {
    expect(
      renderHealthIndicator({
        label: 'Services',
        markers: HEALTH_INDICATOR_ASCII_MARKERS,
        services: [
          { label: 'API', state: 'healthy' },
          { label: 'Queue', reason: 'retry backlog', state: 'degraded' },
        ],
        showReasons: false,
        width: 24,
      }),
    ).toBe('! Services: Degraded - …');
  });

  it('sanitizes labels and reasons', () => {
    expect(
      renderHealthIndicator({
        services: [
          { label: '{bold}API{/bold}', state: 'healthy' },
          {
            label: 'Queue',
            reason: '\u001B[31m{red-fg}retrying{/red-fg}\u001B[0m',
            state: 'degraded',
          },
        ],
      }),
    ).toBe('! Health: Degraded - 1/2 affected\n- Queue: retrying');
  });

  it('rejects invalid services and dimensions', () => {
    expect(() => renderHealthIndicator({ services: [] })).toThrow(RangeError);
    expect(() => renderHealthIndicator({ services: [{ label: '', state: 'healthy' }] })).toThrow(
      RangeError,
    );
    expect(() =>
      renderHealthIndicator({ services: [{ label: 'API', state: 'healthy' }], width: 0 }),
    ).toThrow(RangeError);
    expect(() =>
      renderHealthIndicator({ maxReasons: -1, services: [{ label: 'API', state: 'healthy' }] }),
    ).toThrow(RangeError);
  });
});
