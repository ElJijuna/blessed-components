# HealthIndicator

`HealthIndicator` summarizes multiple service health states and optionally
renders the reasons for affected services.

```ts
import { renderHealthIndicator } from 'blessed-components/health-indicator';

renderHealthIndicator({
  services: [
    { label: 'API', state: 'healthy' },
    { label: 'Queue', reason: 'retry backlog', state: 'degraded' },
  ],
});
// "! Health: Degraded - 1/2 affected\n- Queue: retry backlog"
```

```ts
import blessed from 'blessed';
import { healthIndicator } from 'blessed-components/health-indicator/blessed';

const screen = blessed.screen({ smartCSR: true });
const health = healthIndicator({
  parent: screen,
  box: { top: 0, left: 0, width: 40, height: 4 },
  data: {
    services: [
      { label: 'API', state: 'healthy' },
      { label: 'Queue', reason: 'retry backlog', state: 'degraded' },
    ],
  },
});

screen.render();
health.destroy();
screen.destroy();
```

Use `HealthIndicator` for aggregate service health. Use `ConnectionStatus` for
a single network connection.
