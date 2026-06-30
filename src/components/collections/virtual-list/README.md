# VirtualList

VirtualList renders large ordered collections through a bounded row window. It
preserves the List row format while avoiding full-source rendering.

```ts
import { renderVirtualList } from 'blessed-components/virtual-list';

const output = renderVirtualList({
  height: 5,
  items: rows,
  offset: 1000,
  overscan: 2,
  width: 32,
});
```

Use `computeVirtualListWindow` when an adapter or application needs the source
slice metadata separately:

```ts
import { computeVirtualListWindow } from 'blessed-components/virtual-list';

const window = computeVirtualListWindow({
  height: 10,
  items: rows,
  offset: 250,
  overscan: 3,
});
```

Use the Blessed adapter for keyboard scrolling:

```ts
import { virtualList } from 'blessed-components/virtual-list/blessed';

const view = virtualList({
  box: { height: 8, width: 40 },
  data: { items: rows, overscan: 2 },
  parent: screen,
});

view.pageForward();
```
