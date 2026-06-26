# MutedText

`MutedText` renders secondary text with the same safety and terminal-cell layout
rules as `Text`. The pure renderer returns plain text, while the Blessed adapter
uses the `muted` semantic foreground tone by default.

```ts
import { renderMutedText } from 'blessed-components/muted-text';

renderMutedText({
  content: 'Updated 2 minutes ago',
  overflow: 'truncate',
  width: 12,
});
// "Updated 2 m…"
```

```ts
import blessed from 'blessed';
import { mutedText } from 'blessed-components/muted-text/blessed';

const screen = blessed.screen({ smartCSR: true });
const updated = mutedText({
  parent: screen,
  box: { top: 0, left: 0, width: 24, height: 1 },
  data: {
    content: 'Updated 2 minutes ago',
    overflow: 'truncate',
  },
});

screen.render();
updated.destroy();
screen.destroy();
```

Use `MutedText` for hints, timestamps, descriptions, captions, and other
secondary copy that should remain visually quieter than primary text.
