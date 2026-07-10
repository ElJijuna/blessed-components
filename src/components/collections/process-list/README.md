# ProcessList

Renders process rows with PID, CPU, memory, status, and command.

```ts
import { renderProcessList } from 'blessed-components';

renderProcessList({
  processes: [{ pid: 42, cpu: 7, memory: '32 MB', status: 'run', command: 'node' }],
});
```

## API

`renderProcessList(options)` accepts `processes`, optional `width`, and `height`.

## Accessibility

Column headers remain visible and values are textual, so color is optional.
