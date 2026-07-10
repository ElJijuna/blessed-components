# BuildStatus

Renders build phases, durations, and current outcome.

```ts
import { renderBuildStatus } from 'blessed-components';

renderBuildStatus({
  build: 'release',
  phases: [{ name: 'test', status: 'success', durationMs: 1200 }],
});
```

## API

`renderBuildStatus(options)` accepts `build`, `phases`, optional `status`, `width`, and `height`.

## Accessibility

Phase status is text-first; color adapters can enhance without becoming required.
