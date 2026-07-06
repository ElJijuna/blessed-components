# Pager

Render and control previous/next navigation for bounded pages or records.

```ts
import { renderPager } from 'blessed-components/pager';

renderPager({
  page: 2,
  pageCount: 8,
  width: 32,
});
```

```ts
import { pager } from 'blessed-components/pager/blessed';

const records = pager({
  parent: screen,
  box: { height: 1, width: 32 },
  data: {
    defaultPage: 1,
    pageCount: 8,
    onPageChange(page) {
      loadRecord(page);
    },
  },
});

records.next();
```

The pure renderer returns plain terminal text. The Blessed adapter owns focus,
keyboard, mouse, and wheel listeners while applications decide when to call
`screen.render()`.

Keyboard navigation:

| Key | Action |
| --- | --- |
| `Left`, `PageUp` | Previous |
| `Right`, `PageDown` | Next |
| `Home` | First |
| `End` | Last |
