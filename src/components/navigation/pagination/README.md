# Pagination

Render and control bounded, 1-based page navigation.

```ts
import { renderPagination } from 'blessed-components';

renderPagination({
  page: 5,
  pageCount: 20,
  showBoundaryControls: true,
  width: 32,
});
```

```ts
import { pagination } from 'blessed-components/pagination/blessed';

const pages = pagination({
  parent: screen,
  box: { height: 1, width: 32 },
  data: {
    defaultPage: 1,
    pageCount: 20,
    onPageChange(page) {
      loadPage(page);
    },
  },
});

pages.next();
```

The pure renderer returns plain terminal text. The Blessed adapter owns focus,
keyboard, mouse, and wheel listeners while applications decide when to call
`screen.render()`.

Keyboard navigation:

| Key | Action |
| --- | --- |
| `Left`, `PageUp` | Previous page |
| `Right`, `PageDown` | Next page |
| `Home` | First page |
| `End` | Last page |
