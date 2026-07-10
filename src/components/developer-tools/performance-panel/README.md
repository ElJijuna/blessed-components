# PerformancePanel

Renders runtime performance counters.

```ts
import { renderPerformancePanel } from 'blessed-components';

renderPerformancePanel({ fps: 60, renderMs: 4, memory: '42 MB' });
```

## API

`renderPerformancePanel(options)` accepts optional `fps`, `renderMs`, `eventLoopDelayMs`, `memory`, `width`, and `height`.

## Accessibility

Counters render as labeled text, so thresholds can be color-enhanced without losing meaning.
