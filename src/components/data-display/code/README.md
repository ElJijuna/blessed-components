# Code

Safe inline code text for terminal interfaces.

## Features

- Strips ANSI sequences and Blessed tags.
- Requires non-empty single-line content.
- Optional backtick framing.
- Clip or truncate overflow.
- Pure renderer and Blessed adapter.

## Pure API

```ts
import { renderCode } from 'blessed-components/code';

renderCode({
  content: 'npm run build',
  width: 16,
});
```

## Blessed Adapter

```ts
import { code } from 'blessed-components/code/blessed';

code({
  parent: screen,
  box: { width: 24, height: 1 },
  data: { content: 'npm test' },
});
```

`Code` is for inline snippets. Use block-oriented components for multiline
source or output.
