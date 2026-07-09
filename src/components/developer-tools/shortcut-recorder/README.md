# ShortcutRecorder

Renders recent terminal keypress names for shortcut debugging.

```ts
import { renderShortcutRecorder } from 'blessed-components';

renderShortcutRecorder({ items: [{ key: 'C-c', sequence: '\\u0003' }] });
```

## API

`renderShortcutRecorder(options)` displays an empty prompt until keypress metadata is supplied by an adapter.
