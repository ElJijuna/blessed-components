import { describe, expect, it } from 'vitest';

import { renderProgressList } from '@/index.js';

describe('ProgressList', () => {
  it('renders aligned labeled progress rows', () => {
    expect(
      renderProgressList({
        items: [
          { id: 'api', label: 'API', value: 75 },
          { id: 'worker', label: 'Worker', value: 40 },
        ],
        trackWidth: 10,
      }),
    ).toBe('API    ████████░░ 75%\nWorker ████░░░░░░ 40%');
  });

  it('derives track width from total width and supports ASCII characters', () => {
    expect(
      renderProgressList({
        characters: { empty: '-', filled: '#' },
        items: [
          { id: 'one', label: 'One', value: 5 },
          { id: 'two', label: 'Two', value: 10 },
        ],
        max: 10,
        width: 16,
      }),
    ).toBe('One ####--- 50%\nTwo ####### 100%');
  });

  it('supports custom value formatting, truncation, and height', () => {
    expect(
      renderProgressList({
        formatValue: ({ value }) => `${value} files`,
        height: 1,
        items: [
          { id: 'upload', label: 'Uploaded assets', value: 25 },
          { id: 'skip', label: 'Skipped', value: 10 },
        ],
        labelWidth: 8,
        trackWidth: 6,
      }),
    ).toBe('Uploade… ██░░░░ 25 files');
  });

  it('sanitizes labels and formatted values', () => {
    expect(
      renderProgressList({
        formatValue: () => '\u001B[31m{red-fg}done{/red-fg}\u001B[0m',
        items: [{ id: 'deploy', label: '{bold}Deploy{/bold}', value: 100 }],
        trackWidth: 4,
      }),
    ).toBe('Deploy ████ done');
  });

  it('rejects empty items, labels, dimensions, ranges, and values', () => {
    expect(() => renderProgressList({ items: [] })).toThrow(RangeError);
    expect(() => renderProgressList({ items: [{ id: 'bad', label: ' ', value: 1 }] })).toThrow(
      RangeError,
    );
    expect(() =>
      renderProgressList({ items: [{ id: 'bad', label: 'Bad', value: Number.NaN }] }),
    ).toThrow(RangeError);
    expect(() =>
      renderProgressList({ items: [{ id: 'bad', label: 'Bad', value: 1 }], max: 0 }),
    ).toThrow(RangeError);
    expect(() =>
      renderProgressList({ items: [{ id: 'bad', label: 'Bad', value: 1 }], width: 0 }),
    ).toThrow(RangeError);
  });
});
