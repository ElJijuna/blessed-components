# TreeTable

Renders hierarchical rows with additional columns.

```ts
import { renderTreeTable } from 'blessed-components';

renderTreeTable({
  expandedIds: ['src'],
  columns: [{ key: 'size' }],
  rows: [{ id: 'src', label: 'src', values: { size: '4 KB' } }],
});
```

## API

`renderTreeTable(options)` accepts `rows`, `columns`, optional `expandedIds`, `width`, and `height`.

## Accessibility

Expanded state is represented with `-` and `+`, and labels remain text-first.
