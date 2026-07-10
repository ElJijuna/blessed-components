# ProcessTable

Renders multiple managed process states.

```ts
import { renderProcessTable } from 'blessed-components';

renderProcessTable({ processes: [{ name: 'api', status: 'running', command: 'node server' }] });
```

## API

`renderProcessTable(options)` accepts `processes`, optional `width`, and `height`.

## Accessibility

State and exit code are columns with text values; adapters own signals and cleanup.
