import { describe, expect, it } from 'vitest';

import { PROGRESS_STACK_ASCII_CHARACTERS, renderProgressStack } from '@/index.js';

describe('ProgressStack', () => {
  it('renders a segmented track with legend percentages', () => {
    expect(
      renderProgressStack({
        segments: [
          { id: 'passed', label: 'Passed', value: 30 },
          { id: 'failed', label: 'Failed', value: 10 },
        ],
        width: 10,
      }),
    ).toBe('████████▓▓\n█ Passed 75%\n▓ Failed 25%');
  });

  it('supports ASCII characters and explicit totals', () => {
    expect(
      renderProgressStack({
        characters: PROGRESS_STACK_ASCII_CHARACTERS,
        segments: [
          { id: 'done', label: 'Done', value: 3 },
          { id: 'queued', label: 'Queued', value: 2 },
        ],
        total: 10,
        width: 10,
      }),
    ).toBe('###==     \n# Done 30%\n= Queued 20%');
  });

  it('supports hidden legend, custom value formatting, truncation, and height', () => {
    expect(
      renderProgressStack({
        formatValue: ({ value }) => `${value} jobs`,
        height: 2,
        segments: [
          { id: 'long', label: 'Very long completed segment', value: 2 },
          { id: 'short', label: 'Short', value: 1 },
        ],
        width: 12,
      }),
    ).toBe('████████▓▓▓▓\n█ Very long completed segment 2 jobs');
    expect(
      renderProgressStack({
        segments: [{ id: 'only', label: 'Only', value: 1 }],
        showLegend: false,
        width: 4,
      }),
    ).toBe('████');
  });

  it('sanitizes labels and formatted values', () => {
    expect(
      renderProgressStack({
        formatValue: () => '\u001B[31m{red-fg}done{/red-fg}\u001B[0m',
        segments: [{ id: 'deploy', label: '{bold}Deploy{/bold}', value: 1 }],
        width: 4,
      }),
    ).toBe('████\n█ Deploy done');
  });

  it('rejects invalid segments, dimensions, characters, totals, and values', () => {
    expect(() => renderProgressStack({ segments: [], width: 4 })).toThrow(RangeError);
    expect(() =>
      renderProgressStack({ segments: [{ id: 'bad', label: ' ', value: 1 }], width: 4 }),
    ).toThrow(RangeError);
    expect(() =>
      renderProgressStack({ segments: [{ id: 'bad', label: 'Bad', value: -1 }], width: 4 }),
    ).toThrow(RangeError);
    expect(() =>
      renderProgressStack({
        segments: [{ id: 'bad', label: 'Bad', value: 1 }],
        total: 0,
        width: 4,
      }),
    ).toThrow(RangeError);
    expect(() =>
      renderProgressStack({
        characters: ['OK'],
        segments: [{ id: 'bad', label: 'Bad', value: 1 }],
        width: 4,
      }),
    ).toThrow(RangeError);
  });
});
