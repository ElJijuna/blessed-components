# Tag

`Tag` renders compact categorization labels such as resource types, filters, and
labels. The pure renderer returns plain text, while the Blessed adapter uses the
`primary` semantic foreground tone by default.

```ts
import { renderTag } from 'blessed-components/tag';

renderTag({
  text: 'production',
});
// "#production"
```

```ts
import { renderTag } from 'blessed-components/tag';

renderTag({
  removable: true,
  text: 'region:us-east',
  width: 12,
  overflow: 'truncate',
});
// "#region:us-…"
```

```ts
import blessed from 'blessed';
import { tag } from 'blessed-components/tag/blessed';

const screen = blessed.screen({ smartCSR: true });
const filter = tag({
  parent: screen,
  box: { top: 0, left: 0, width: 18, height: 1 },
  data: {
    removable: true,
    text: 'production',
  },
});

screen.render();
filter.destroy();
screen.destroy();
```

Use `Tag` for compact categories and removable filter chips. Use `Badge` when
the text communicates semantic status such as success, warning, or danger.
