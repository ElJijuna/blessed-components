# AnsiViewer

Renders ANSI-formatted output after sanitizing terminal control sequences.

```ts
import { renderAnsiViewer } from 'blessed-components';

renderAnsiViewer({ lines: ['\\u001b[31merror\\u001b[0m'] });
```

## API

`renderAnsiViewer(options)` accepts `lines`, optional `width`, and `height`.

## Accessibility

Escapes and colors are removed by the shared plain-text renderer; meaningful text remains.
