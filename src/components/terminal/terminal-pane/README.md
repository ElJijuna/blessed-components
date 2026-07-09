# TerminalPane

`TerminalPane` renders a display-only terminal session with command metadata,
status, stdout/stderr/system lines, and bounded scroll output.

The pure renderer and Blessed adapter do not execute commands, spawn processes,
or interpret shell strings. Feed it output from your own process manager.

```ts
import { renderTerminalPane } from 'blessed-components/terminal-pane';

const content = renderTerminalPane({
  command: { command: 'npm', args: ['run', 'test'] },
  lines: [
    { stream: 'stdout', text: '243 files passed' },
    { stream: 'stderr', text: '{red-fg}slow test{/red-fg}' },
  ],
  status: 'running',
  width: 48,
});
```

## Blessed

```ts
import { terminalPane } from 'blessed-components/terminal-pane/blessed';

const pane = terminalPane({
  box: { border: 'line', height: 10, width: 64 },
  data: {
    command: { command: 'npm', args: ['run', 'test'] },
    status: 'running',
  },
  parent: screen,
});

pane.append({ stream: 'stdout', text: 'ready' });
pane.scrollTo(0);
```

## API

- `renderTerminalPane(options)` returns safe plain terminal text.
- `formatTerminalPaneCommand(command)` formats display-only command metadata.
- `terminalPane({ parent, box, data })` creates a focusable Blessed viewport.
- Adapter handle: `append`, `appendMany`, `clear`, `focus`, `home`,
  `lineBackward`, `lineForward`, `pageBackward`, `pageForward`, `scrollTo`,
  `setStatus`, `lines`, `setData`, `destroy`.

Dynamic text is sanitized before rendering, so ANSI sequences and Blessed tags
cannot inject terminal control sequences.
