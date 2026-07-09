# EventLog

Renders structured events for debugging terminal UI behavior.

```ts
import { renderEventLog } from 'blessed-components';

renderEventLog({
  items: [{ level: 'info', scope: 'render', message: 'complete' }],
});
```

## API

`renderEventLog(options)` supports severity, scope, timestamp labels, newest-first ordering, width, and height.
