import { describe, expect, it } from 'vitest';

import { renderLoadingOverlay } from '@/index.js';

describe('LoadingOverlay', () => {
  it('renders centered loading content with spinner and sanitized detail', () => {
    expect(
      renderLoadingOverlay({
        description: 'Waiting for {bold}health checks{/bold}',
        frame: 1,
        frames: ['.', 'o'],
        label: 'Deploying',
        width: 30,
      }),
    ).toBe('         o Deploying\n\n  Waiting for health checks');
  });

  it('can render without the spinner marker', () => {
    expect(
      renderLoadingOverlay({
        frame: 0,
        label: 'Loading',
        showSpinner: false,
        width: 12,
      }),
    ).toBe('  Loading');
  });

  it('rejects invalid frames and dimensions through composed renderers', () => {
    expect(() => renderLoadingOverlay({ frame: -1 })).toThrow(RangeError);
    expect(() => renderLoadingOverlay({ frame: 0, width: 0 })).toThrow(RangeError);
  });
});
