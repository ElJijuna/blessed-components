# Callout

`Callout` renders framed explanatory content with a semantic marker. It is
useful for hints, warnings, and contextual notes that need more visual weight
than an inline `Alert`.

```ts
import { renderCallout } from 'blessed-components/callout';

renderCallout({
  title: 'Deploy delayed',
  content: 'Retry after health checks recover.',
  tone: 'warning',
  width: 24,
});
```

```text
╭──────────────────────╮
│ ! Deploy delayed     │
│ Retry after health   │
│ checks recover.      │
╰──────────────────────╯
```

```ts
import blessed from 'blessed';
import { callout } from 'blessed-components/callout/blessed';

const screen = blessed.screen({ smartCSR: true });
const note = callout({
  parent: screen,
  box: { top: 0, left: 0, width: 30, height: 5 },
  data: {
    content: 'Retry after health checks recover.',
    tone: 'warning',
  },
});

screen.render();
note.destroy();
screen.destroy();
```

Use `Alert` for compact inline messages and `Callout` for framed explanatory
content that should stand apart from surrounding text.
