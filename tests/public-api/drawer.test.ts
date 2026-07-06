import { describe, expect, it, vi } from 'vitest';

import { createDrawerState, renderDrawerRegion } from '@/index.js';

describe('Drawer', () => {
  it('manages uncontrolled open state and emits changes', () => {
    const onOpenChange = vi.fn();
    const drawer = createDrawerState({
      defaultOpen: false,
      onOpenChange,
    });

    expect(drawer.isOpen()).toBe(false);
    expect(drawer.open()).toBe(true);
    expect(drawer.toggle()).toBe(false);
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('keeps controlled state unchanged until new options arrive', () => {
    const onOpenChange = vi.fn();
    const drawer = createDrawerState({
      onOpenChange,
      open: false,
    });

    expect(drawer.open()).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    drawer.setOptions({ onOpenChange, open: true });

    expect(drawer.isOpen()).toBe(true);
  });

  it('renders safe Drawer region text', () => {
    expect(
      renderDrawerRegion({
        content: '{bold}Deploy{/bold}\nProduction rollout',
        height: 2,
        width: 18,
      }),
    ).toBe('Deploy\nProduction rollout');
  });
});
