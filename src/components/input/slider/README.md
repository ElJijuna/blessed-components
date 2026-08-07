# Slider

Horizontal numeric input for selecting one value from a bounded range.

```ts
import { renderSlider } from 'blessed-components/slider';
import { slider } from 'blessed-components/slider/blessed';
```

## Pure renderer

`width` is the number of terminal cells in the track, including the thumb.
The label is always visible, and focus or disabled state is represented with a
character marker so meaning never depends on color.

```ts
renderSlider({
  formatValue: ({ value }) => `${value}%`,
  label: 'Volume',
  max: 100,
  min: 0,
  step: 5,
  value: 40,
  width: 16,
});
```

Values are clamped to `min`/`max` and aligned to the nearest `step`, anchored at
`min`. Import `normalizeSliderValue` when the same normalization is needed
outside the renderer.

## Blessed adapter

The adapter supports controlled `value` and uncontrolled `defaultValue` usage.
It returns `value()`, `setValue()`, `increment()`, `decrement()`, `setToMin()`,
`setToMax()`, `focus()`, `setData()`, and `destroy()`.

Keyboard and pointer controls:

- Right/Up: increment by `step`.
- Left/Down: decrement by `step`.
- PageUp/PageDown: adjust by `largeStep`, which defaults to ten steps.
- Home/End: move to the minimum or maximum.
- Mouse wheel: increment or decrement.
- Click on the track: select the nearest step.

The adapter never calls `screen.render()`; callers decide when to paint after
handling `onValueChange`.
