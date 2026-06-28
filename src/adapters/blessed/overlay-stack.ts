import type blessed from 'blessed';

import { createOverlayStack, type OverlayStackModel } from '@/primitives/overlay/index.js';

const screenOverlays = new WeakMap<blessed.Widgets.Screen, OverlayStackModel>();

/** Returns the shared Blessed overlay stack for one screen. */
export function getScreenOverlayStack(screen: blessed.Widgets.Screen): OverlayStackModel {
  const existing = screenOverlays.get(screen);

  if (existing !== undefined) {
    return existing;
  }

  const created = createOverlayStack();

  screenOverlays.set(screen, created);

  return created;
}
