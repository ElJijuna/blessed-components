# BigText

Renders large-text fallback using spaced uppercase characters.

```ts
import { renderBigText } from 'blessed-components';

renderBigText({ text: 'OK' });
```

## API

`renderBigText(options)` accepts `text`, optional `width`, and `height`.

## Accessibility

Original text remains readable; decorative large-glyph adapters can build on this fallback.
