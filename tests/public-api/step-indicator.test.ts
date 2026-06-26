import { describe, expect, it } from 'vitest';

import { renderStepIndicator, STEP_INDICATOR_ASCII_MARKERS } from '@/index.js';

describe('StepIndicator', () => {
  it('renders vertical steps with state markers and detail', () => {
    expect(
      renderStepIndicator({
        steps: [
          { id: 'install', label: 'Install', state: 'completed' },
          { detail: 'compiling', id: 'build', label: 'Build', state: 'active' },
          { id: 'deploy', label: 'Deploy' },
        ],
      }),
    ).toBe('✓ Install\n● Build - compiling\n○ Deploy');
  });

  it('supports horizontal ASCII output', () => {
    expect(
      renderStepIndicator({
        markers: STEP_INDICATOR_ASCII_MARKERS,
        orientation: 'horizontal',
        steps: [
          { id: 'one', label: 'One', state: 'completed' },
          { id: 'two', label: 'Two', state: 'active' },
          { id: 'three', label: 'Three' },
        ],
      }),
    ).toBe('+ One  > Two  - Three');
  });

  it('wraps vertical content and bounds by height', () => {
    expect(
      renderStepIndicator({
        height: 3,
        steps: [
          {
            detail: 'waiting for checks',
            id: 'deploy',
            label: 'Deploy production',
            state: 'active',
          },
        ],
        width: 16,
      }),
    ).toBe('● Deploy\n  production -\n  waiting for');
  });

  it('sanitizes terminal markup', () => {
    expect(
      renderStepIndicator({
        steps: [
          {
            detail: '\u001B[31m{red-fg}Done{/red-fg}\u001B[0m',
            id: 'one',
            label: '{bold}Install{/bold}',
            state: 'completed',
          },
        ],
      }),
    ).toBe('✓ Install - Done');
  });

  it('rejects empty steps, labels, dimensions, and wide markers', () => {
    expect(() => renderStepIndicator({ steps: [] })).toThrow(RangeError);
    expect(() => renderStepIndicator({ steps: [{ id: 'bad', label: ' ' }] })).toThrow(RangeError);
    expect(() =>
      renderStepIndicator({
        steps: [{ id: 'one', label: 'One' }],
        width: 0,
      }),
    ).toThrow(RangeError);
    expect(() =>
      renderStepIndicator({
        markers: { active: 'OK', completed: '+', error: 'x', pending: '-' },
        steps: [{ id: 'one', label: 'One' }],
      }),
    ).toThrow(RangeError);
  });
});
