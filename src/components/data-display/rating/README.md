# Rating

Renders a discrete score with visible numeric fallback.

```ts
import { renderRating } from 'blessed-components';

renderRating({ value: 4, max: 5 });
```

## API

`renderRating(options)` accepts `value`, optional `max`, `filled`, `empty`, and `width`.

## Accessibility

Numeric text (`4/5`) is always rendered, so glyphs are not the only signal.
