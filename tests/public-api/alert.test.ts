import { describe, expect, it } from 'vitest';

import { ALERT_ASCII_MARKERS, renderAlert } from '@/index.js';

describe('Alert', () => {
  it('renders a semantic title and description', () => {
    expect(
      renderAlert({
        description: 'Retrying in 10s',
        title: 'Deploy delayed',
        tone: 'warning',
      }),
    ).toBe('! Deploy delayed\n  Retrying in 10s');
  });

  it('supports ASCII markers and markerless output', () => {
    expect(
      renderAlert({
        description: 'All checks passed',
        markers: ALERT_ASCII_MARKERS,
        tone: 'success',
      }),
    ).toBe('+ All checks passed');
    expect(renderAlert({ description: 'Plain message', showMarker: false })).toBe('Plain message');
  });

  it('wraps title and description within terminal width', () => {
    expect(
      renderAlert({
        description: 'Retry deployment after health checks recover',
        title: 'Warning',
        tone: 'warning',
        width: 18,
      }),
    ).toBe('! Warning\n  Retry deployment\n  after health\n  checks recover');
  });

  it('sanitizes terminal markup', () => {
    expect(
      renderAlert({
        description: '\u001B[31m{red-fg}Failed{/red-fg}\u001B[0m',
        title: '{bold}Deploy{/bold}',
        tone: 'danger',
      }),
    ).toBe('× Deploy\n  Failed');
  });

  it('rejects empty content, invalid width, and wide markers', () => {
    expect(() => renderAlert({ description: '   ' })).toThrow(RangeError);
    expect(() => renderAlert({ description: 'Ready', width: 0 })).toThrow(RangeError);
    expect(() => renderAlert({ description: 'Ready', marker: 'OK' })).toThrow(RangeError);
  });
});
