# ToastViewport

Renders a bounded stack of transient notifications.

```ts
import { renderToastViewport } from 'blessed-components';

renderToastViewport({
  items: [{ id: 'deploy', title: 'Deploy', message: 'Done', tone: 'success' }],
  limit: 3,
});
```

## API

`renderToastViewport(options)` accepts ordered toast items, semantic tones, newest-first rendering, width, and height.
