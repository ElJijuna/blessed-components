# Skeleton

Renders fixed-size placeholder rows while async content loads.

```ts
import { renderSkeleton } from 'blessed-components';

renderSkeleton({ label: 'Loading packages', rows: 2, width: 12 });
```

## API

`renderSkeleton(options)` accepts `width`, optional `rows`, `label`, `character`, and `height`.

## Accessibility

Pair skeletons with adjacent loading status text in interactive adapters so screen readers and logs have explicit state.
