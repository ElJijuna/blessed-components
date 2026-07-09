# CodeViewer

Renders source code with an optional language header and line numbers.

```ts
import { renderCodeViewer } from 'blessed-components';

renderCodeViewer({ language: 'ts', code: 'const value = 1;' });
```

## API

`renderCodeViewer(options)` strips terminal markup and supports `firstLine`, `lineNumbers`, width, and height.
