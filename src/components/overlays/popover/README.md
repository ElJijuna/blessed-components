# Popover

Renders anchored temporary content with side metadata.

```ts
import { renderPopover } from 'blessed-components';

renderPopover({
  side: 'right',
  title: 'Details',
  content: ['owner: cli'],
});
```

## API

`renderPopover(options)` accepts `content`, optional `title`, `side`, `width`, and `height`.

## Accessibility

Adapters should connect popovers to their trigger, close on Escape, and return focus to the trigger.
