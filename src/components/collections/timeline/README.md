# Timeline

Timeline renders ordered events with optional timestamps and semantic status
markers. The pure renderer is deterministic, bounded by terminal-cell
dimensions, and sanitizes event text through the shared Status renderer.

```ts
import { renderTimeline } from 'blessed-components/timeline';

const output = renderTimeline({
  height: 3,
  items: [
    {
      id: 'queued',
      timestamp: '2026-06-29T15:25:00Z',
      title: 'Deploy queued',
      tone: 'info',
    },
    {
      detail: '24 pods ready',
      id: 'healthy',
      timestamp: '2026-06-29T15:35:00Z',
      title: 'Deploy healthy',
      tone: 'success',
    },
  ],
  timeZone: 'UTC',
  width: 48,
});
```

Use the Blessed adapter when you want a managed box element:

```ts
import { timeline } from 'blessed-components/timeline/blessed';

const events = timeline({
  box: { height: 6, width: 56 },
  data: {
    items: [
      { id: 'queued', title: 'Deploy queued', tone: 'info' },
      { id: 'healthy', title: 'Deploy healthy', tone: 'success' },
    ],
  },
  parent: screen,
});

events.setData({
  items: [{ id: 'failed', title: 'Deploy failed', tone: 'danger' }],
});
```
