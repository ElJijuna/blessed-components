# MarkdownViewer

Renders Markdown as safe plain terminal text.

```ts
import { renderMarkdownViewer } from 'blessed-components';

renderMarkdownViewer({ markdown: '# Title\\n**bold**' });
```

## API

`renderMarkdownViewer(options)` accepts `markdown`, optional `width`, and `height`.

## Accessibility

Markdown styling degrades to readable plain text; adapters can add richer parsing later.
