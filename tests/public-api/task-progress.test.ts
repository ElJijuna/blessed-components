import { describe, expect, it } from 'vitest';

import { renderTaskProgress, TASK_PROGRESS_ASCII_MARKERS } from '@/index.js';

describe('TaskProgress', () => {
  it('renders title, activity, progress, and steps', () => {
    expect(
      renderTaskProgress({
        activity: 'Running checks',
        steps: [
          { id: 'install', label: 'Install', state: 'completed' },
          { id: 'test', label: 'Test', state: 'active' },
        ],
        title: 'Release',
        value: 50,
        width: 18,
      }),
    ).toBe('● Release\nRunning checks\n███████░░░░░░ 50%\n✓ Install\n● Test');
  });

  it('supports ASCII markers and progress characters', () => {
    expect(
      renderTaskProgress({
        characters: { empty: '-', filled: '#' },
        markers: TASK_PROGRESS_ASCII_MARKERS,
        status: 'success',
        title: 'Done',
        value: 100,
        width: 12,
      }),
    ).toBe('+ Done\n####### 100%');
  });

  it('supports markerless output and height bounding', () => {
    expect(
      renderTaskProgress({
        activity: 'This activity wraps across rows',
        height: 2,
        showMarker: false,
        title: 'Build package',
        width: 14,
      }),
    ).toBe('Build package\nThis activity');
  });

  it('sanitizes terminal markup', () => {
    expect(
      renderTaskProgress({
        activity: '\u001B[31m{red-fg}Running{/red-fg}\u001B[0m',
        showProgress: false,
        title: '{bold}Deploy{/bold}',
      }),
    ).toBe('● Deploy\nRunning');
  });

  it('rejects empty titles, invalid dimensions, and invalid progress ranges', () => {
    expect(() => renderTaskProgress({ title: '   ' })).toThrow(RangeError);
    expect(() => renderTaskProgress({ title: 'Task', width: 0 })).toThrow(RangeError);
    expect(() => renderTaskProgress({ max: 0, title: 'Task', value: 1 })).toThrow(RangeError);
  });
});
