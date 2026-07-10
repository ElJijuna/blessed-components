# Pill

Renders a compact label with configurable text caps.

```ts
import { renderPill } from 'blessed-components';

renderPill({ label: 'beta' });
```

## API

`renderPill(options)` accepts `label`, optional `left`, `right`, and `width`.

## Accessibility

Pill text is preserved as plain text; caps are decorative.
