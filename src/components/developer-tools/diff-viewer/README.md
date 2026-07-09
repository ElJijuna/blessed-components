# DiffViewer

Renders unified diff rows from structured line data.

```ts
import { renderDiffViewer } from 'blessed-components';

renderDiffViewer({
  lines: [
    { kind: 'remove', text: 'old' },
    { kind: 'add', text: 'new' },
  ],
});
```

## API

`renderDiffViewer(options)` uses explicit add, remove, and context markers so output remains useful without color.
