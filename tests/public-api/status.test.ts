import { describe, expect, it } from 'vitest';

import { renderStatus, STATUS_ASCII_MARKERS } from '@/index.js';

describe('Status', () => {
  it('renders semantic status with optional detail', () => {
    expect(
      renderStatus({
        detail: '24ms',
        label: 'Healthy',
        tone: 'success',
      }),
    ).toBe('✓ Healthy - 24ms');
  });

  it('supports ASCII markers and markerless output', () => {
    expect(
      renderStatus({
        label: 'Offline',
        markers: STATUS_ASCII_MARKERS,
        tone: 'danger',
      }),
    ).toBe('x Offline');
    expect(renderStatus({ label: 'Ready', showMarker: false })).toBe('Ready');
  });

  it('sanitizes terminal markup in label and detail', () => {
    expect(
      renderStatus({
        detail: '\u001B[31m{red-fg}Degraded{/red-fg}\u001B[0m',
        label: '{bold}API{/bold}',
        tone: 'warning',
      }),
    ).toBe('! API - Degraded');
  });

  it('rejects empty labels and wide markers', () => {
    expect(() => renderStatus({ label: '   ' })).toThrow(RangeError);
    expect(() => renderStatus({ label: 'Ready', marker: 'OK' })).toThrow(RangeError);
  });
});
