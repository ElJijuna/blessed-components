# RequestInspector

Renders HTTP request/response metadata and body preview.

```ts
import { renderRequestInspector } from 'blessed-components';

renderRequestInspector({ method: 'GET', url: '/health', status: 200 });
```

## API

`renderRequestInspector(options)` accepts `method`, `url`, optional `status`, `headers`, `body`, `width`, and `height`.

## Accessibility

Status and headers render as plain text. Adapters should avoid hiding failures behind color only.
