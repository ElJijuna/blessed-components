# Donut

Renders part-to-whole values as a text-first donut summary.

```ts
import { renderDonut } from 'blessed-components';

renderDonut({ segments: [{ label: 'used', value: 7 }, { label: 'free', value: 3 }] });
```

## API

`renderDonut(options)` accepts `segments`, optional `total`, `width`, and `height`.

## Accessibility

Percent and value text are primary; radial visuals can be adapter enhancement later.
