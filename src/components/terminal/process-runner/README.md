# ProcessRunner

Renders command execution state without spawning processes.

```ts
import { renderProcessRunner } from 'blessed-components';

renderProcessRunner({ command: 'npm test', status: 'running', output: ['vitest'] });
```

## API

`renderProcessRunner(options)` accepts `command`, `status`, optional `exitCode`, `output`, `width`, and `height`.

## Accessibility

Execution status and exit code are text-first. Adapters own process lifecycle and cancellation.
