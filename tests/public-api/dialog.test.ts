import { describe, expect, it, vi } from 'vitest';

import { createDialogState } from '@/index.js';

describe('Dialog', () => {
  it('manages uncontrolled open state and emits changes', () => {
    const onOpenChange = vi.fn();
    const dialog = createDialogState({
      defaultOpen: false,
      onOpenChange,
    });

    expect(dialog.isOpen()).toBe(false);
    expect(dialog.open()).toBe(true);
    expect(dialog.toggle()).toBe(false);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('keeps controlled state unchanged until new options arrive', () => {
    const onOpenChange = vi.fn();
    const dialog = createDialogState({
      onOpenChange,
      open: false,
    });

    expect(dialog.open()).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    dialog.setOptions({ onOpenChange, open: true });

    expect(dialog.isOpen()).toBe(true);
  });
});
