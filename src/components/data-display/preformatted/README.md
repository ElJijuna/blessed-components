# Preformatted

`Preformatted` renders multiline terminal text without wrapping. It preserves
source spaces and line breaks, strips ANSI sequences and Blessed tags, and clips
through explicit horizontal and vertical viewport offsets.

```ts
import { renderPreformatted } from 'blessed-components/preformatted';

renderPreformatted({
  content: '  npm run build\n  npm test',
  height: 2,
  width: 10,
});
```

## Blessed adapter

```ts
import { preformatted } from 'blessed-components/preformatted/blessed';

const block = preformatted({
  box: { height: 8, width: 48 },
  data: {
    content: 'first line\nsecond line',
  },
  parent: screen,
});

block.columnForward();
block.lineForward();
```
