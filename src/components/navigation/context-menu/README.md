# ContextMenu

Renders anchored action choices with active and disabled state.

```ts
import { renderContextMenu } from 'blessed-components';

renderContextMenu({
  activeId: 'open',
  items: [{ id: 'open', label: 'Open', shortcut: 'Enter' }],
});
```

## API

`renderContextMenu(options)` accepts `items`, optional `activeId`, `width`, and `height`.

## Accessibility

Items expose stable ids so adapters can provide keyboard movement, activation, and focus return.
