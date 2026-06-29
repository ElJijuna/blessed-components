# ConnectionStatus

`ConnectionStatus` renders online, reconnecting, and offline states with an
optional latency and detail.

```ts
import { renderConnectionStatus } from 'blessed-components/connection-status';

renderConnectionStatus({
  latency: 42,
  state: 'online',
});
// "✓ Online - 42ms"
```

```ts
import blessed from 'blessed';
import { connectionStatus } from 'blessed-components/connection-status/blessed';

const screen = blessed.screen({ smartCSR: true });
const connection = connectionStatus({
  parent: screen,
  box: { top: 0, left: 0, width: 24, height: 1 },
  data: {
    latency: 120,
    state: 'reconnecting',
  },
});

screen.render();
connection.destroy();
screen.destroy();
```

Use `ConnectionStatus` for compact network or service connectivity summaries.
Use `HealthIndicator` for aggregated service health with multiple reasons.
