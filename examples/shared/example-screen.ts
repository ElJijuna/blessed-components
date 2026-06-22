import { PassThrough } from 'node:stream';

import blessed from 'blessed';

export interface ExampleHandle {
  destroy(): void;
}

export interface ExampleScreen {
  screen: blessed.Widgets.Screen;
  smoke: boolean;
}

export function createExampleScreen(title: string): ExampleScreen {
  const smoke = process.argv.includes('--smoke');
  const input = smoke ? new PassThrough() : process.stdin;
  const output = smoke ? new PassThrough() : process.stdout;
  const screen = blessed.screen({
    dockBorders: true,
    fullUnicode: true,
    input,
    mouse: !smoke,
    output,
    smartCSR: true,
    terminal: smoke ? 'xterm-256color' : undefined,
    title,
  });

  return { screen, smoke };
}

export function completeExample(
  name: string,
  screen: blessed.Widgets.Screen,
  handles: readonly ExampleHandle[],
  smoke: boolean,
  cleanup?: () => void,
): void {
  let destroyed = false;

  const destroy = (): void => {
    if (destroyed) {
      return;
    }

    destroyed = true;
    cleanup?.();

    for (const handle of handles.toReversed()) {
      handle.destroy();
    }

    screen.destroy();
  };

  if (smoke) {
    screen.render();
    destroy();
    process.stdout.write(`${name} smoke test passed.\n`);

    return;
  }

  screen.key(['q', 'C-c'], destroy);
  screen.render();
}
