import { describe, expect, it } from 'vitest';

import { renderErrorState } from '@/index.js';

describe('ErrorState', () => {
  it('renders message, cause, and retry hint', () => {
    expect(
      renderErrorState({
        cause: 'Connection refused',
        message: 'Failed to load projects',
        retry: 'Press r to retry',
        showMarker: false,
      }),
    ).toBe('Failed to load projects\n\nConnection refused\nPress r to retry');
  });

  it('aligns content within a configured width', () => {
    expect(
      renderErrorState({
        cause: 'Request timed out',
        message: 'Sync failed',
        width: 24,
      }),
    ).toBe('     × Sync failed\n\n   Request timed out');
  });

  it('wraps and bounds output by height', () => {
    expect(
      renderErrorState({
        align: 'left',
        cause: 'The upstream service returned unavailable',
        height: 3,
        message: 'Deploy failed',
        width: 18,
      }),
    ).toBe('× Deploy failed\n\nThe upstream');
  });

  it('sanitizes terminal markup', () => {
    expect(
      renderErrorState({
        cause: '\u001B[31m{red-fg}Boom{/red-fg}\u001B[0m',
        message: '{bold}Failed{/bold}',
        showMarker: false,
      }),
    ).toBe('Failed\n\nBoom');
  });

  it('rejects empty messages, invalid dimensions, and wide markers', () => {
    expect(() => renderErrorState({ message: '   ' })).toThrow(RangeError);
    expect(() => renderErrorState({ message: 'Failed', width: 0 })).toThrow(RangeError);
    expect(() => renderErrorState({ marker: 'ERR', message: 'Failed' })).toThrow(RangeError);
  });
});
