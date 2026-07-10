# Resizable

Clamps and renders one resizable region size.

```ts
import { renderResizable } from 'blessed-components';

renderResizable({ label: 'sidebar', size: 22, min: 12, max: 40 });
```

## API

`clampResizableSize(options)` clamps one size. `renderResizable(options)` renders label, size, axis, and bounds.

## Accessibility

Adapters should provide keyboard resize shortcuts and announce min/max limits.
