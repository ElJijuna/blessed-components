# ShellHistory

Renders searchable shell command history.

```ts
import { renderShellHistory } from 'blessed-components';

renderShellHistory({ query: 'git', items: [{ id: '1', command: 'git status' }] });
```

## API

`renderShellHistory(options)` accepts `items`, optional `query`, `activeId`, `width`, and `height`.

## Accessibility

Query and active command render as text. Adapters own command insertion and shell integration.
