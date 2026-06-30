# Center

Center positions one child inside the available terminal-cell rectangle. It can
center, start-align, end-align, or stretch each axis independently.

```ts
import { calculateCenterLayout } from 'blessed-components/center';

const child = calculateCenterLayout({
  height: 12,
  item: { height: 4, width: 20 },
  width: 80,
});
```

Use the Blessed adapter to center a direct child element:

```ts
import { center } from 'blessed-components/center/blessed';

const container = center({
  box: { height: '100%', width: '100%' },
  parent: screen,
});

blessed.box({
  height: 6,
  parent: container.element,
  width: 32,
});

container.layout();
```
