import { describe, expect, it } from 'vitest';

import { renderLabel } from '@/index.js';

describe('Label', () => {
  it('renders safe one-line labels with a stable suffix', () => {
    expect(
      renderLabel({
        content: '\u001B[31m{bold}Project{/bold}\u001B[0m',
      }),
    ).toBe('Project:');
  });

  it('adds required indicators with a configurable gap', () => {
    expect(
      renderLabel({
        content: 'Owner',
        indicatorGap: 2,
        required: true,
      }),
    ).toBe('Owner  *:');
  });

  it('supports alignment and single-line truncation', () => {
    expect(
      renderLabel({
        align: 'right',
        content: 'Environment',
        required: true,
        width: 10,
      }),
    ).toBe('Environme…');
  });

  it('can omit suffixes for compact value labels', () => {
    expect(
      renderLabel({
        content: 'Status',
        suffix: '',
        width: 8,
      }),
    ).toBe('Status');
  });

  it('rejects empty required indicators', () => {
    expect(() =>
      renderLabel({
        content: 'Project',
        required: true,
        requiredIndicator: '',
      }),
    ).toThrow(RangeError);
  });
});
