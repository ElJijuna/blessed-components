# Tooltip

Renders contextual help text with optional placement metadata.

```ts
import { renderTooltip } from 'blessed-components';

renderTooltip({ message: 'Save changes before deploy', placement: 'bottom' });
```

## API

`renderTooltip(options)` strips terminal markup, wraps by terminal cells, and clips by height.
