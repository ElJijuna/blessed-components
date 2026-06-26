import { describe, expect, it } from 'vitest';

import { renderEmptyState } from '@/index.js';

describe('EmptyState', () => {
  it('renders title, description, and action', () => {
    expect(
      renderEmptyState({
        action: 'Press / to search',
        description: 'Try a different query.',
        showMarker: false,
        title: 'No results',
      }),
    ).toBe('No results\n\nTry a different query.\n\nPress / to search');
  });

  it('aligns content within a configured width', () => {
    expect(
      renderEmptyState({
        description: 'Create one to continue',
        title: 'No projects',
        width: 24,
      }),
    ).toBe('     ○ No projects\n\n Create one to continue');
  });

  it('wraps and bounds output by height', () => {
    expect(
      renderEmptyState({
        align: 'left',
        description: 'Create a project or adjust your filters',
        height: 3,
        title: 'No matching projects',
        width: 16,
      }),
    ).toBe('○ No matching\n  projects\n');
  });

  it('sanitizes terminal markup', () => {
    expect(
      renderEmptyState({
        description: '\u001B[31m{red-fg}Nothing{/red-fg}\u001B[0m',
        showMarker: false,
        title: '{bold}Empty{/bold}',
      }),
    ).toBe('Empty\n\nNothing');
  });

  it('rejects empty titles, invalid dimensions, and wide markers', () => {
    expect(() => renderEmptyState({ title: '   ' })).toThrow(RangeError);
    expect(() => renderEmptyState({ title: 'Empty', width: 0 })).toThrow(RangeError);
    expect(() => renderEmptyState({ marker: 'OK', title: 'Empty' })).toThrow(RangeError);
  });
});
