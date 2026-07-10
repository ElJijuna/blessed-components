# AspectRatio

Calculates and renders terminal-cell dimensions that preserve a requested ratio.

```ts
import { renderAspectRatio } from 'blessed-components';

renderAspectRatio({ width: 16, ratioWidth: 16, ratioHeight: 9 });
```

## API

`calculateAspectRatioSize(options)` returns `{ width, height }`.
`renderAspectRatio(options)` renders deterministic text for previews and tests.

## Accessibility

Adapters should label the preserved region with the content purpose, not only its numeric ratio.
