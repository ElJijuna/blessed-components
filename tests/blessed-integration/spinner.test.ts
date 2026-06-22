import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { spinner } from '@/adapters/blessed/spinner.js';
import { createTheme } from '@/core/theme.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('Blessed Spinner adapter', () => {
  it('ticks deterministically with ASCII fallback and semantic tone', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const theme = createTheme({
      colors: { primary: 'cyan' },
    });

    try {
      const component = spinner({
        box: { height: 1, width: 20 },
        data: {
          autoStart: false,
          capabilities: { colorLevel: 1, unicode: false },
          label: 'Loading',
          theme,
          tone: 'primary',
        },
        parent: screen,
      });

      expect(component.element.getContent()).toBe('| Loading');
      expect(component.element.style.fg).toBe('cyan');
      expect(component.running).toBe(false);

      component.tick();

      expect(component.element.getContent()).toBe('/ Loading');
    } finally {
      screen.destroy();
    }
  });

  it('starts, stops, and destroys its owned timer', () => {
    vi.useFakeTimers();

    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const onFrame = vi.fn();
    const component = spinner({
      box: { height: 1, width: 10 },
      data: {
        autoStart: false,
        capabilities: { colorLevel: 1, unicode: true },
        interval: 50,
        onFrame,
      },
      parent: screen,
    });

    component.start();
    vi.advanceTimersByTime(100);

    expect(component.running).toBe(true);
    expect(onFrame).toHaveBeenCalledTimes(2);

    component.stop();
    vi.advanceTimersByTime(100);

    expect(component.running).toBe(false);
    expect(onFrame).toHaveBeenCalledTimes(2);

    component.start();
    component.destroy();
    vi.advanceTimersByTime(100);

    expect(onFrame).toHaveBeenCalledTimes(2);
    screen.destroy();
  });

  it('rejects invalid intervals before attaching an element', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const childCount = screen.children.length;

    try {
      expect(() =>
        spinner({
          data: { interval: 0 },
          parent: screen,
        }),
      ).toThrow(RangeError);
      expect(screen.children).toHaveLength(childCount);
    } finally {
      screen.destroy();
    }
  });
});
