import { describe, expect, it } from 'vitest';

import { renderHexViewer } from '@/index.js';

describe('HexViewer', () => {
  it('renders offsets, hex, and ascii preview', () => {
    expect(renderHexViewer({ bytes: [72, 105, 10], columns: 3 })).toBe('00000000  48 69 0a  Hi.');
  });
});
