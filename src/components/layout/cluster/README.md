# Cluster

Cluster lays out direct children left-to-right and wraps them onto new rows
when they no longer fit. It is useful for badges, filters, action groups, and
compact toolbars.

```ts
import { calculateClusterLayout } from 'blessed-components/cluster';

const positions = calculateClusterLayout({
  gap: 1,
  height: 4,
  items: [
    { height: 1, width: 6 },
    { height: 1, width: 8 },
    { height: 1, width: 5 },
  ],
  width: 16,
});
```

Use the Blessed adapter to wrap direct child elements:

```ts
import { cluster } from 'blessed-components/cluster/blessed';

const actions = cluster({
  box: { height: 4, width: 32 },
  data: { gap: 1 },
  parent: screen,
});

actions.layout();
```
