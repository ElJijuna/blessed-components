# TaskRunner

Renders named tasks with active state.

```ts
import { renderTaskRunner } from 'blessed-components';

renderTaskRunner({ activeTask: 'build', tasks: [{ name: 'build', status: 'running' }] });
```

## API

`renderTaskRunner(options)` accepts `tasks`, optional `activeTask`, `width`, and `height`.

## Accessibility

Active state and task status render as text. Adapters own execution and cancellation.
