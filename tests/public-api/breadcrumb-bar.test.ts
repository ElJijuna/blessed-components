import { describe, expect, it } from 'vitest';
import {
  BREADCRUMB_BAR_ASCII_CHARACTERS,
  renderBreadcrumbBar,
  renderBreadcrumbBarModel,
} from '@/index.js';

describe('BreadcrumbBar', () => {
  const items = [{ label: 'Projects' }, { label: 'API' }] as const;
  const actions = [{ id: 'refresh', label: 'Refresh', shortcut: 'R' }] as const;

  it('renders a path, sibling navigation, and contextual actions', () => {
    expect(
      renderBreadcrumbBar({
        actions,
        activeTarget: 'previous',
        items,
        nextSibling: { id: 'worker', label: 'Worker' },
        pad: false,
        previousSibling: { id: 'web', label: 'Web' },
        width: 70,
      }),
    ).toBe('Projects / API │ ▸‹ Web◂  Worker › │ Refresh [R]');
  });

  it('supports ASCII characters and active actions', () => {
    expect(
      renderBreadcrumbBar({
        actions,
        activeTarget: 'action:refresh',
        characters: BREADCRUMB_BAR_ASCII_CHARACTERS,
        items,
        pad: false,
        width: 50,
      }),
    ).toBe('Projects / API | >Refresh [R]<');
  });

  it('collapses responsively and reports visible targets', () => {
    expect(
      renderBreadcrumbBarModel({
        actions,
        items: [{ label: 'Home' }, ...items],
        nextSibling: { id: 'worker', label: 'Worker' },
        pad: false,
        width: 27,
      }),
    ).toEqual({
      content: 'Home / … / … │ Worker › │ …',
      visibleActionIds: [],
      visibleTargets: ['next'],
    });
  });

  it('validates width, siblings, path items, and actions', () => {
    expect(() => renderBreadcrumbBar({ items, width: -1 })).toThrow(RangeError);
    expect(() =>
      renderBreadcrumbBar({ items, nextSibling: { id: '', label: 'Next' }, width: 20 }),
    ).toThrow(RangeError);
    expect(() => renderBreadcrumbBar({ items: [{ label: '' }], width: 20 })).toThrow(RangeError);
    expect(() =>
      renderBreadcrumbBar({ actions: [{ id: '', label: 'Bad' }], items, width: 20 }),
    ).toThrow(RangeError);
  });
});
