import { describe, expect, it } from 'vitest';

import { BANNER_ASCII_MARKERS, renderBanner } from '@/index.js';

describe('Banner', () => {
  it('renders app-level status with semantic context', () => {
    expect(
      renderBanner({ message: 'Deployments are paused', title: 'Maintenance', tone: 'warning' }),
    ).toBe('! Maintenance: Deployments are paused');
  });

  it('fills the requested width and aligns an action', () => {
    expect(
      renderBanner({ action: 'View', message: 'Service restored', tone: 'success', width: 32 }),
    ).toBe('✓ Service restored        [View]');
  });

  it('supports ASCII and markerless output', () => {
    expect(
      renderBanner({ markers: BANNER_ASCII_MARKERS, message: 'Offline', tone: 'danger' }),
    ).toBe('x Offline');
    expect(renderBanner({ message: 'Read only', showMarker: false })).toBe('Read only');
  });

  it('sanitizes markup and validates input', () => {
    expect(renderBanner({ message: '\u001B[31m{bold}Offline{/bold}\u001B[0m' })).toBe('i Offline');
    expect(() => renderBanner({ message: ' ' })).toThrow(RangeError);
    expect(() => renderBanner({ marker: 'NO', message: 'Offline' })).toThrow(RangeError);
    expect(() => renderBanner({ message: 'Offline', width: 0 })).toThrow(RangeError);
  });
});
