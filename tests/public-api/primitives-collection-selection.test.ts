import { describe, expect, it, vi } from 'vitest';

import { createCollection, createSelectionModel } from '@/primitives/index.js';

describe('collection and selection primitives', () => {
  const items = [
    { id: 'alpha', label: 'Alpha' },
    { disabled: true, id: 'beta', label: 'Beta' },
    { id: 'gamma', label: 'Gamma' },
  ] as const;

  it('navigates enabled collection items without mutating caller data', () => {
    const collection = createCollection(items);

    expect(collection.first()).toEqual(items[0]);
    expect(collection.last()).toEqual(items[2]);
    expect(collection.next('alpha')).toEqual(items[2]);
    expect(collection.next('gamma')).toEqual(items[0]);
    expect(collection.previous('alpha')).toEqual(items[2]);
    expect(collection.items()).toEqual(items);
    expect(collection.items()).not.toBe(items);
  });

  it('supports non-looping collection navigation and rejects duplicate ids', () => {
    const collection = createCollection(items);

    expect(collection.next('gamma', { loop: false })).toBeUndefined();
    expect(collection.previous('alpha', { loop: false })).toBeUndefined();
    expect(() => createCollection([{ id: 'same' }, { id: 'same' }])).toThrow(RangeError);
  });

  it('manages single selection and ignores disabled items', () => {
    const onChange = vi.fn();
    const selection = createSelectionModel({
      defaultSelectedIds: ['alpha'],
      items,
      onChange,
    });

    expect(selection.toggle('beta')).toBe(false);
    expect(selection.select('gamma')).toBe(true);
    expect(selection.selectedIds()).toEqual(['gamma']);
    expect(onChange).toHaveBeenCalledWith(['gamma']);
  });

  it('manages multiple selection with deterministic item order', () => {
    const selection = createSelectionModel({
      defaultSelectedIds: ['gamma'],
      items,
      mode: 'multiple',
    });

    selection.toggle('alpha');
    expect(selection.selectedIds()).toEqual(['alpha', 'gamma']);

    selection.toggle('gamma');
    expect(selection.selectedIds()).toEqual(['alpha']);

    selection.clear();
    expect(selection.selectedIds()).toEqual([]);
  });
});
