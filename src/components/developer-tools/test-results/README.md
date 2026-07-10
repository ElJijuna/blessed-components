# TestResults

Renders suite/test outcomes, durations, failures, and summary counts.

```ts
import { renderTestResults } from 'blessed-components';

renderTestResults({
  tests: [{ suite: 'core', name: 'renders', status: 'passed', durationMs: 4 }],
});
```

## API

`renderTestResults(options)` accepts `tests`, optional `width`, and `height`.

## Accessibility

Rows include text status (`PASS`, `FAIL`, `SKIP`) before decorative or colored styling in adapters.
