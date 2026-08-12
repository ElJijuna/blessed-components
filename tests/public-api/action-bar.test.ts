import { describe, expect, it } from 'vitest';

import { ACTION_BAR_ASCII_CHARACTERS, renderActionBar, renderActionBarModel } from '@/index.js';

describe('ActionBar', () => {
  const actions = [
    { id: 'run', label: 'Run', shortcut: 'Enter' },
    { id: 'stop', label: 'Stop', separator: true, shortcut: 'S' },
    { disabled: true, disabledReason: 'No job', id: 'retry', label: 'Retry' },
  ] as const;

  it('renders labels, shortcuts, selection, separators, and disabled reasons', () => {
    expect(renderActionBar({ actions, activeId: 'run', width: 80 })).toBe(
      '▸Run [Enter]◂ │ Stop [S]  (Retry: No job)',
    );
  });

  it('uses ASCII characters and sanitizes dynamic terminal markup', () => {
    expect(renderActionBar({
      actions: [{ id: 'run', label: '{bold}\u001B[31mRun\u001B[0m{/bold}', shortcut: 'R' }],
      activeId: 'run', characters: ACTION_BAR_ASCII_CHARACTERS, width: 20,
    })).toBe('>Run [R]<');
  });

  it('shows overflow and reports only visible action ids', () => {
    const result = renderActionBarModel({ actions, width: 17 });

    expect(result.content).toBe('Run [Enter] …');
    expect(result.visibleActionIds).toEqual(['run']);
  });

  it('pads output and validates width and required text', () => {
    expect(renderActionBar({ actions: [actions[0]], pad: true, width: 16 })).toHaveLength(16);
    expect(() => renderActionBar({ actions, width: -1 })).toThrow(RangeError);
    expect(() => renderActionBar({ actions: [{ id: '', label: 'Bad' }], width: 10 })).toThrow(RangeError);
  });
});
