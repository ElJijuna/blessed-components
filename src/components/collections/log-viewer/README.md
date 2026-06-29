# LogViewer

Streaming log viewport with retention, pause/resume, and deterministic rendering.

## Features

- Structured log entries with id, message, level, source, and timestamp.
- Bounded retention through `maxEntries`.
- Pause queues new entries without changing visible rows.
- Resume flushes queued entries.
- Pure renderer for tests and static output.
- Blessed adapter for scrolling, follow mode, and imperative appends.

## Pure API

```ts
import { createLogViewerState, renderLogViewer } from 'blessed-components/log-viewer';

const logs = createLogViewerState({ maxEntries: 500 });

logs.append({
  id: '1',
  level: 'info',
  message: 'Server started',
  source: 'api',
});

const content = renderLogViewer({
  entries: logs.entries(),
  height: 10,
  width: 80,
});
```

## Blessed Adapter

```ts
import { logViewer } from 'blessed-components/log-viewer/blessed';

const logs = logViewer({
  parent: screen,
  box: { width: '100%', height: '100%' },
  data: { maxEntries: 1000, follow: true },
});

logs.append({ id: 'boot', message: 'Application booted' });
```

## Keyboard

| Key | Behavior |
| --- | --- |
| Up / Down | Scroll one row |
| PageUp / PageDown | Scroll one page |
| Home / End | Jump to start or end |
| Space | Pause or resume |

`append()` and `appendMany()` never call `screen.render()`. Applications remain
responsible for render batching.
