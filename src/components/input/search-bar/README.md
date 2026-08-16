# SearchBar

`SearchBar` combines a one-line query, optional search scopes, submit and clear
actions, and result metadata. Its state model supports controlled and
uncontrolled query and scope values independently of Blessed.

```ts
import { createSearchBarState, renderSearchBar } from 'blessed-components/search-bar';

const scopes = [
  { id: 'all', label: 'All' },
  { id: 'services', label: 'Services' },
];
const search = createSearchBarState({
  defaultScopeId: 'all',
  scopes,
  onSubmit: ({ query, scope }) => findResources(query, scope?.id),
});

renderSearchBar({
  query: search.query(),
  resultCount: 12,
  scopeId: search.activeScope()?.id,
  scopes,
  width: 60,
});
```

The Blessed adapter uses Tab and Shift-Tab to move between scope, query, clear,
and submit controls. Up/Down changes the selected scope, Enter activates the
current control, and Escape clears the query. Left/Right remain available for
text editing while the query control is active.

```ts
import { searchBar } from 'blessed-components/search-bar/blessed';

const search = searchBar({
  box: { border: 'line', height: 3, width: 64 },
  data: {
    placeholder: 'name or label',
    resultCount: 12,
    scopes,
    onSubmit: ({ query, scope }) => loadResults(query, scope?.id),
  },
  parent: screen,
});
```
