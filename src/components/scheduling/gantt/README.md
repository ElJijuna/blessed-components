# Gantt

Renders time-based task spans on a fixed track.

```ts
import { renderGantt } from 'blessed-components';

renderGantt({ width: 12, tasks: [{ label: 'build', start: 1, end: 4 }] });
```

## API

`renderGantt(options)` accepts `tasks`, `width`, optional `min`, `max`, and `height`.

## Accessibility

Task labels are text-first. Adapters should expose exact start/end values.
