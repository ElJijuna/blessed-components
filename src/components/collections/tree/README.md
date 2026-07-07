# Tree

Expandable hierarchical navigation for terminal applications.

## Imports

```ts
import { renderTree } from 'blessed-components/tree';
import { tree } from 'blessed-components/tree/blessed';
```

## Pure Renderer

```ts
const content = renderTree({
  activeId: 'src',
  expandedIds: new Set(['root']),
  height: 6,
  nodes: [
    {
      id: 'root',
      label: 'Project',
      children: [{ id: 'src', label: 'src' }],
    },
  ],
  selectedId: 'src',
  width: 32,
});
```

The renderer is deterministic, does not import Blessed, and never mutates the
caller-owned node tree.

## Blessed Adapter

```ts
const files = tree({
  parent: screen,
  box: { top: 0, left: 0, width: 40, height: 12 },
  data: {
    defaultExpandedIds: ['root'],
    nodes,
    onValueChange: (id) => {
      selectedFileId = id;
    },
  },
});
```

Keyboard support:

- `up` / `down`: move through enabled visible nodes.
- `home` / `end`: move to first or last enabled visible node.
- `pageup` / `pagedown`: move by viewport pages.
- `left` / `right`: collapse or expand the active node.
- `space`: toggle the active expandable node.
- `enter`: select the active node.
