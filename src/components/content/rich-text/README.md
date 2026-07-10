# RichText

Renders styled spans as safe plain text.

```ts
import { renderRichText } from 'blessed-components';

renderRichText({ spans: [{ text: 'Hello' }, { text: ' world', tone: 'muted' }] });
```

## API

`renderRichText(options)` accepts `spans`, optional `width`, and `height`.

## Accessibility

Text content stays contiguous and readable without style support.
