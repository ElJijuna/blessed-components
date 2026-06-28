# SearchField

`SearchField` renders a labeled single-line query input with optional
placeholder, hint, error, required marker, disabled state, and clear affordance.

```ts
import { renderSearchField } from 'blessed-components/search-field';

renderSearchField({
  hint: 'Press Enter to search.',
  label: 'Filter',
  placeholder: 'service name',
  query: '',
  width: 32,
});
```

For Blessed apps, use the adapter:

```ts
import { searchField } from 'blessed-components/search-field/blessed';

const filter = searchField({
  box: { height: 4, width: 40 },
  data: {
    label: 'Filter',
    onClear() {
      // Reset filtered results.
    },
    onSubmit(query) {
      // Run a search.
    },
    placeholder: 'service name',
  },
  parent: screen,
});
```

The adapter supports controlled `query` data and uncontrolled `defaultQuery`
data. Use `onQueryChange` to mirror edits into controlled state.
