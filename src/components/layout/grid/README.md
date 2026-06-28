# Grid

`Grid` lays out direct Blessed children in evenly distributed rows and columns.
It supports gaps, explicit placements, and row/column spans.

```ts
import { calculateGridLayout } from 'blessed-components/grid';

calculateGridLayout({
  columns: 3,
  gap: 1,
  height: 7,
  items: [
    { columnSpan: 2 },
    {},
    { column: 0, row: 1, columnSpan: 3 },
  ],
  width: 32,
});
```

For Blessed apps, use the adapter:

```ts
import { grid } from 'blessed-components/grid/blessed';

const layout = grid({
  box: { height: 12, width: 48 },
  data: {
    columns: 3,
    gap: 1,
    items: [{ columnSpan: 2 }, {}, { column: 0, row: 1, columnSpan: 3 }],
  },
  parent: screen,
});

// Add children to layout.element, then:
layout.layout();
```

Call `layout()` after adding, removing, or reordering direct children. Resizing
the Grid or calling `setData()` triggers layout automatically.
