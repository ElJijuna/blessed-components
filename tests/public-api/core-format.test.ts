import { describe, expect, it } from 'vitest';

import {
  formatBytes,
  formatDateTime,
  formatDuration,
  formatNumber,
  formatPercent,
  formatRate,
} from '@/core/index.js';

describe('core format utilities', () => {
  it('formats numbers and percentages with explicit locale options', () => {
    expect(formatNumber(1_250_000, { locale: 'en-US', notation: 'compact' })).toBe('1.3M');
    expect(formatPercent(0.856, { digits: 1, locale: 'en-US' })).toBe('85.6%');
  });

  it('formats bytes, durations, and rates', () => {
    expect(formatBytes(1536, { system: 'iec' })).toBe('1.5 KiB');
    expect(formatDuration(3_661_000, { style: 'clock' })).toBe('1:01:01');
    expect(formatRate(120, { interval: 's', unit: 'req' })).toBe('120 req/s');
  });

  it('formats dates deterministically with a time zone', () => {
    expect(
      formatDateTime(new Date('2026-01-02T03:04:00Z'), {
        locale: 'en-CA',
        timeZone: 'UTC',
      }),
    ).toContain('2026');
  });
});
