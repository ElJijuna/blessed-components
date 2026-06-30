# Spacer

Spacer reserves empty terminal space along one axis. It can use a fixed size or
fill the available parent dimension.

```ts
import { calculateSpacerLayout } from 'blessed-components/spacer';

const gap = calculateSpacerLayout({
  axis: 'vertical',
  height: 12,
  size: 2,
  width: 40,
});
```

Use the Blessed adapter for an empty element that sizes itself from its parent:

```ts
import { spacer } from 'blessed-components/spacer/blessed';

const gap = spacer({
  data: { axis: 'vertical', size: 1 },
  parent: stack.element,
});
```
