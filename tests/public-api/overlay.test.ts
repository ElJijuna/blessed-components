import { describe, expect, it, vi } from 'vitest';

import { createOverlayState } from '@/index.js';

describe('Overlay', () => {
  it('manages uncontrolled open state', () => {
    const onOpenChange = vi.fn();
    const overlay = createOverlayState({ defaultOpen: true, onOpenChange });

    expect(overlay.isOpen()).toBe(true);
    expect(overlay.close()).toBe(false);
    expect(overlay.isOpen()).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    expect(overlay.toggle()).toBe(true);
    expect(overlay.isOpen()).toBe(true);
  });

  it('keeps controlled state unchanged until options update', () => {
    const onOpenChange = vi.fn();
    const overlay = createOverlayState({ onOpenChange, open: false });

    expect(overlay.open()).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(overlay.isOpen()).toBe(false);

    expect(overlay.setOptions({ onOpenChange, open: true })).toBe(true);
    expect(overlay.isOpen()).toBe(true);
  });

  it('preserves visible state when switching from controlled to uncontrolled', () => {
    const overlay = createOverlayState({ open: true });

    expect(overlay.setOptions({})).toBe(true);
    expect(overlay.close()).toBe(false);
  });
});
