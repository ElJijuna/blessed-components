# LogExplorer

Searchable and filterable log viewport for terminal applications.

## Imports

```ts
import { filterLogExplorerEntries, renderLogExplorer } from 'blessed-components/log-explorer';
import { logExplorer } from 'blessed-components/log-explorer/blessed';
```

## Pure Renderer

```ts
const content = renderLogExplorer({
  entries,
  filter: {
    levels: ['warn', 'error'],
    query: 'deploy',
    sources: ['api'],
  },
  height: 8,
  width: 80,
});
```

`LogExplorer` reuses the `LogViewer` row contract and adds deterministic
filtering by text query, level, and source.

## Blessed Adapter

```ts
const logs = logExplorer({
  parent: screen,
  box: { top: 0, left: 0, width: 80, height: 16, border: 'line' },
  data: {
    entries,
    filter: { query: 'timeout' },
    follow: true,
  },
});
```

Keyboard support:

- `up` / `down` or `k` / `j`: scroll by one row.
- `pageup` / `pagedown`: scroll by one page.
- `home` / `end`: jump to the start or end.
- `space`: pause or resume appended entries.
