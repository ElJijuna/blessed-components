# Carousel

Renders one active slide with stable position metadata.

```ts
import { renderCarousel } from 'blessed-components';

renderCarousel({
  activeIndex: 1,
  slides: [
    { id: 'one', label: 'One', content: 'First' },
    { id: 'two', label: 'Two', content: 'Second' },
  ],
});
```

## API

`renderCarousel(options)` accepts `slides`, optional `activeIndex`, `width`, and `height`.

## Accessibility

Position text (`2/3`) stays visible so timed or manual rotation is understandable without relying on animation.
