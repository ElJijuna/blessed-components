# DateInput

Renders a labeled date field preview and exposes `parseDateInput` for `YYYY-MM-DD` validation.

```ts
import { parseDateInput, renderDateInput } from 'blessed-components';

renderDateInput({ label: 'Start', value: '2026-07-09', width: 20 });
parseDateInput('2026-07-09', { min: '2026-01-01' });
```

## API

- `renderDateInput(options)` returns safe terminal text.
- `parseDateInput(input, options)` returns a discriminated validation result.

The renderer strips ANSI sequences and Blessed tags. Adapters should provide keyboard editing, focus, and submit handling.
