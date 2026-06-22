import { PassThrough } from 'node:stream';

import blessed from 'blessed';
import { describe, expect, it } from 'vitest';

import {
  type BlessedComponentHandle,
  badge,
  box,
  cardBody,
  cardRoot,
  divider,
  list,
  metricBars,
  progressBar,
  sparkline,
  spinner,
  stack,
  stat,
  text,
} from '../../src/index.js';

function updateAndDestroy<TData>(handle: BlessedComponentHandle<TData>, data: TData): void {
  handle.setData(data);
  handle.destroy();
}

describe('Blessed component handle contract', () => {
  it('is shared by every display component adapter', () => {
    const screen = blessed.screen({
      input: new PassThrough(),
      output: new PassThrough(),
      terminal: 'xterm-256color',
    });
    const badgeHandle = badge({ data: { text: 'Ready' }, parent: screen });
    const boxHandle = box({
      box: { height: 4, width: 20 },
      parent: screen,
    });
    const cardHandle = cardRoot({ parent: screen });
    const cardBodyHandle = cardBody({
      data: { content: 'Ready' },
      parent: cardHandle.element,
    });
    const dividerHandle = divider({
      box: { height: 1, width: 10 },
      parent: screen,
    });
    const progressHandle = progressBar({
      data: { value: 50, width: 4 },
      parent: screen,
    });
    const sparklineHandle = sparkline({
      data: { values: [1, 2], width: 2 },
      parent: screen,
    });
    const spinnerHandle = spinner({
      data: { autoStart: false, label: 'Loading' },
      parent: screen,
    });
    const stackHandle = stack({
      box: { height: 4, width: 20 },
      parent: screen,
    });
    const statHandle = stat({ data: { label: 'Jobs', value: 4 }, parent: screen });
    const listHandle = list({
      data: { items: [{ id: 'one', label: 'One' }] },
      parent: screen,
    });
    const textHandle = text({
      data: { content: 'Ready' },
      parent: screen,
    });
    const handles = [
      badgeHandle,
      boxHandle,
      cardHandle,
      cardBodyHandle,
      dividerHandle,
      progressHandle,
      sparklineHandle,
      spinnerHandle,
      stackHandle,
      statHandle,
    ];
    const bars = metricBars({
      data: { barWidth: 2, metrics: [{ label: 'CPU', value: 50 }] },
      parent: screen,
    });

    expect(handles.every(({ element }) => element.type === 'box')).toBe(true);
    expect(bars.element.type).toBe('box');

    updateAndDestroy(badgeHandle, { text: 'Done' });
    updateAndDestroy(boxHandle, {});
    updateAndDestroy(cardBodyHandle, { content: 'Done' });
    updateAndDestroy(cardHandle, {});
    updateAndDestroy(dividerHandle, {});
    updateAndDestroy(progressHandle, { value: 75, width: 4 });
    updateAndDestroy(sparklineHandle, { values: [2, 1], width: 2 });
    updateAndDestroy(spinnerHandle, { autoStart: false, label: 'Done' });
    updateAndDestroy(stackHandle, {});
    updateAndDestroy(statHandle, { label: 'Jobs', value: 5 });
    updateAndDestroy(listHandle, {
      items: [{ id: 'two', label: 'Two' }],
    });
    updateAndDestroy(textHandle, { content: 'Done' });
    updateAndDestroy(bars, {
      barWidth: 2,
      metrics: [{ label: 'CPU', value: 75 }],
    });
    screen.destroy();
  });
});
