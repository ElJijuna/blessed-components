# CommitList

Renders commit summaries with short hashes, refs, message, and author.

```ts
import { renderCommitList } from 'blessed-components';

renderCommitList({
  commits: [{ hash: 'abcdef123', message: 'Add UI', refs: ['HEAD'], author: 'Ada' }],
});
```

## API

`renderCommitList(options)` accepts `commits`, optional `width`, and `height`.

## Accessibility

Short hashes remain visible and refs are rendered in text before adapters add highlighting.
