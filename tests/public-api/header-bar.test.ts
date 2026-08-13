import { describe, expect, it } from 'vitest';
import { ACTION_BAR_ASCII_CHARACTERS, renderHeaderBar, renderHeaderBarModel } from '@/index.js';

describe('HeaderBar', () => {
  const actions = [
    { id: 'refresh', label: 'Refresh', shortcut: 'R' },
    { id: 'settings', label: 'Settings' },
  ] as const;

  it('renders identity, context, status, and right actions', () => {
    expect(
      renderHeaderBar({
        actions,
        activeActionId: 'refresh',
        environment: 'prod',
        pad: false,
        status: { label: 'online', marker: '●' },
        title: 'Console',
        width: 70,
        workspace: 'payments',
      }),
    ).toBe('Console · payments / prod · ● online           ▸Refresh [R]◂  Settings');
  });
  it('supports ASCII and sanitizes text', () => {
    expect(
      renderHeaderBar({
        actions: [actions[0]],
        characters: ACTION_BAR_ASCII_CHARACTERS,
        environment: '{bold}prod{/bold}',
        pad: false,
        title: 'App',
        width: 30,
      }),
    ).toBe('App · prod         Refresh [R]');
  });
  it('clips actions responsively and reports ids', () => {
    expect(renderHeaderBarModel({ actions, pad: false, title: 'Console', width: 28 })).toEqual({
      content: 'Console        Refresh [R] …',
      visibleActionIds: ['refresh'],
    });
  });
  it('validates title and width', () => {
    expect(() => renderHeaderBar({ title: '', width: 20 })).toThrow(RangeError);
    expect(() => renderHeaderBar({ title: 'App', width: -1 })).toThrow(RangeError);
  });
});
