import { describe, expect, it } from 'vitest';

import { createFocusScope, createOverlayStack } from '../../src/primitives/index.js';

describe('focus-scope and overlay primitives', () => {
  it('captures, traps, and restores focus identifiers', () => {
    const scope = createFocusScope({
      items: [{ id: 'cancel' }, { disabled: true, id: 'hidden' }, { id: 'confirm' }],
    });

    expect(scope.activate('open-dialog')).toBe('cancel');
    expect(scope.next()).toBe('confirm');
    expect(scope.next()).toBe('cancel');
    expect(scope.previous()).toBe('confirm');
    expect(scope.deactivate()).toBe('open-dialog');
    expect(scope.current()).toBeUndefined();
  });

  it('supports non-trapped focus scopes', () => {
    const scope = createFocusScope({
      items: [{ id: 'first' }, { id: 'last' }],
      trapped: false,
    });

    scope.activate();
    scope.focus('last');

    expect(scope.next()).toBeUndefined();
    expect(scope.current()).toBe('last');
  });

  it('orders overlays and returns focus restoration metadata on close', () => {
    const overlays = createOverlayStack();

    overlays.open({ id: 'menu', restoreFocusId: 'menu-button' });
    overlays.open({ id: 'dialog', modal: true, restoreFocusId: 'delete-button' });

    expect(overlays.top()?.id).toBe('dialog');
    expect(overlays.isBlocked('menu')).toBe(true);
    expect(overlays.close()).toEqual({
      overlay: {
        dismissOnEscape: true,
        id: 'dialog',
        modal: true,
        restoreFocusId: 'delete-button',
      },
      restoreFocusId: 'delete-button',
    });
    expect(overlays.top()?.id).toBe('menu');
  });

  it('dismisses only the top escape-enabled overlay', () => {
    const overlays = createOverlayStack();

    overlays.open({ id: 'base' });
    overlays.open({ dismissOnEscape: false, id: 'locked' });

    expect(overlays.handleEscape()).toBeUndefined();
    expect(overlays.top()?.id).toBe('locked');
    expect(() => overlays.open({ id: 'locked' })).toThrow(RangeError);
  });
});
