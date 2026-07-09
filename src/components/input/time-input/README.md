# TimeInput

Renders a labeled 24-hour time field preview and exposes `parseTimeInput` for `HH:mm` validation.

```ts
import { parseTimeInput, renderTimeInput } from 'blessed-components';

renderTimeInput({ label: 'Run at', value: '09:30', width: 16 });
parseTimeInput('09:30', { min: '09:00', max: '17:00' });
```

## API

- `renderTimeInput(options)` returns safe terminal text.
- `parseTimeInput(input, options)` validates range and returns minutes after midnight.

The renderer keeps validation visible through hint and error lines.
