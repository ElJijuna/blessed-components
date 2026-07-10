import { describe, expect, it } from 'vitest';

import { renderAnsiViewer } from '@/index.js';

describe('AnsiViewer', () => {
  it('strips terminal escape formatting', () => {
    expect(renderAnsiViewer({ lines: ['\u001b[31merror\u001b[0m'] })).toBe('error');
  });
});
