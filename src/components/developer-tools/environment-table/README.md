# EnvironmentTable

Renders environment variables with deterministic secret masking.

```ts
import { renderEnvironmentTable } from 'blessed-components';

renderEnvironmentTable({
  items: [{ name: 'TOKEN', value: 'secret', secret: true }],
});
```

## API

`renderEnvironmentTable(options)` aligns keys, masks secret values, and strips terminal markup.
