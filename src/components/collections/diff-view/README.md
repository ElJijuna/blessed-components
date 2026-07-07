# DiffView

Scrollable unified diff rendering for terminal applications.

## Imports

```ts
import { renderDiffView } from 'blessed-components/diff-view';
import { diffView } from 'blessed-components/diff-view/blessed';
```

## Pure Renderer

```ts
const content = renderDiffView({
  height: 6,
  width: 72,
  lines: [
    { content: '@@ -1,2 +1,2 @@', type: 'hunk' },
    { content: 'const status = "queued";', oldLine: 1, type: 'remove' },
    { content: 'const status = "running";', newLine: 1, type: 'add' },
    { content: 'export { status };', newLine: 2, oldLine: 2, type: 'context' },
  ],
});
```

The renderer strips ANSI sequences and Blessed tags from dynamic text before
truncating each row to the requested terminal width.

## Blessed Adapter

```ts
const patch = diffView({
  parent: screen,
  box: { top: 0, left: 0, width: 80, height: 16, border: 'line' },
  data: { lines },
});
```

Keyboard support:

- `up` / `down` or `k` / `j`: scroll by one row.
- `pageup` / `pagedown`: scroll by one page.
- `home` / `end`: jump to the start or end.
