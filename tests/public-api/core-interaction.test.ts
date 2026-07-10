import { describe, expect, it, vi } from 'vitest';

import {
  createEventBus,
  createFocusModel,
  createKeymap,
  distributeSpace,
  insetRect,
} from '@/core/index.js';

describe('core interaction and layout models', () => {
  it('publishes typed events and unsubscribes listeners', () => {
    const bus = createEventBus<{ change: number }>();
    const listener = vi.fn();
    const unsubscribe = bus.on('change', listener);

    bus.emit('change', 2);
    unsubscribe();
    bus.emit('change', 3);

    expect(listener).toHaveBeenCalledOnce();
    expect(listener).toHaveBeenCalledWith(2);
  });

  it('clears one event channel or all listeners', () => {
    const bus = createEventBus<{ change: number; submit: string }>();
    const change = vi.fn();
    const submit = vi.fn();

    bus.on('change', change);
    bus.on('submit', submit);
    bus.clear('change');
    bus.emit('change', 1);
    bus.emit('submit', 'ok');
    bus.clear();
    bus.emit('submit', 'again');

    expect(change).not.toHaveBeenCalled();
    expect(submit).toHaveBeenCalledExactlyOnceWith('ok');
  });

  it('matches normalized key chords and exposes help metadata', () => {
    const save = vi.fn();
    const search = vi.fn();
    const keymap = createKeymap([
      {
        description: 'Save',
        handler: save,
        id: 'save',
        keys: ['C-s'],
      },
      {
        description: 'Search backwards',
        handler: search,
        id: 'search-backwards',
        keys: ['M-S-f'],
      },
    ]);

    expect(keymap.handle({ ctrl: true, name: 's' })).toBe(true);
    expect(keymap.handle({ meta: true, name: 'f', shift: true })).toBe(true);
    expect(keymap.handle({ name: 'f' })).toBe(false);
    expect(save).toHaveBeenCalledOnce();
    expect(search).toHaveBeenCalledOnce();
    expect(keymap.help()).toEqual([
      { description: 'Save', id: 'save', keys: ['C-s'] },
      { description: 'Search backwards', id: 'search-backwards', keys: ['M-S-f'] },
    ]);
  });

  it('moves focus with wrapping and disabled items', () => {
    const focus = createFocusModel([{ id: 'one' }, { disabled: true, id: 'two' }, { id: 'three' }]);

    expect(focus.current()).toBe('one');
    expect(focus.next()).toBe('three');
    expect(focus.next()).toBe('one');
    expect(focus.previous()).toBe('three');
  });

  it('falls back to first enabled item when initial focus is unavailable', () => {
    const focus = createFocusModel(
      [{ disabled: true, id: 'one' }, { id: 'two' }, { id: 'three' }],
      'missing',
    );

    expect(focus.current()).toBe('two');
    expect(focus.focus('one')).toBe('two');
    expect(focus.focus('three')).toBe('three');
  });

  it('insets rectangles and distributes integer space', () => {
    expect(
      insetRect({ height: 10, width: 20, x: 0, y: 0 }, { bottom: 1, left: 2, right: 2, top: 1 }),
    ).toEqual({ height: 8, width: 16, x: 2, y: 1 });
    expect(distributeSpace(10, [1, 2, 1])).toEqual([3, 5, 2]);
  });
});
