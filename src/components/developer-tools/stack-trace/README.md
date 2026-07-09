# StackTrace

Renders stack frames with stable numbering and file locations.

```ts
import { renderStackTrace } from 'blessed-components';

renderStackTrace({
  error: 'TypeError: boom',
  frames: [{ functionName: 'run', file: 'src/app.ts', line: 12 }],
});
```

## API

`renderStackTrace(options)` accepts structured frames rather than runtime-specific stack strings.
