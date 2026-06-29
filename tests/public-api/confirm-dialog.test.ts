import { describe, expect, it } from 'vitest';

import { normalizeConfirmDialogAction } from '@/index.js';

describe('ConfirmDialog', () => {
  it('normalizes safe action labels', () => {
    expect(
      normalizeConfirmDialogAction({
        label: '\u001B[31m{bold}Delete{/bold}\u001B[0m',
        result: 'confirm',
      }),
    ).toEqual({
      label: 'Delete',
      result: 'confirm',
    });
  });

  it('rejects empty and multiline action labels', () => {
    expect(() =>
      normalizeConfirmDialogAction({
        label: '',
        result: 'cancel',
      }),
    ).toThrow(RangeError);
    expect(() =>
      normalizeConfirmDialogAction({
        label: 'Delete\nnow',
        result: 'confirm',
      }),
    ).toThrow(RangeError);
  });
});
