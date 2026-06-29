import { describe, expect, it } from 'vitest';

import { CONNECTION_STATUS_ASCII_MARKERS, renderConnectionStatus } from '@/index.js';

describe('ConnectionStatus', () => {
  it('renders online state with latency', () => {
    expect(renderConnectionStatus({ latency: 42, state: 'online' })).toBe('✓ Online - 42ms');
  });

  it('renders reconnecting and offline states', () => {
    expect(renderConnectionStatus({ detail: 'retrying', state: 'reconnecting' })).toBe(
      '! Reconnecting - retrying',
    );
    expect(renderConnectionStatus({ state: 'offline' })).toBe('× Offline');
  });

  it('supports custom labels, ASCII markers, and markerless output', () => {
    expect(
      renderConnectionStatus({
        label: 'API',
        latency: 120.4,
        markers: CONNECTION_STATUS_ASCII_MARKERS,
        state: 'online',
      }),
    ).toBe('+ API - 120ms');
    expect(renderConnectionStatus({ showMarker: false, state: 'offline' })).toBe('Offline');
  });

  it('sanitizes label and detail through Status', () => {
    expect(
      renderConnectionStatus({
        detail: '\u001B[31m{red-fg}retrying{/red-fg}\u001B[0m',
        label: '{bold}API{/bold}',
        state: 'reconnecting',
      }),
    ).toBe('! API - retrying');
  });

  it('rejects invalid latency and Status input', () => {
    expect(() => renderConnectionStatus({ latency: -1 })).toThrow(RangeError);
    expect(() => renderConnectionStatus({ label: '   ' })).toThrow(RangeError);
    expect(() => renderConnectionStatus({ marker: 'OK' })).toThrow(RangeError);
  });
});
