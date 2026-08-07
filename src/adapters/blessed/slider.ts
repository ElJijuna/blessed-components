import blessed from 'blessed';

import {
  normalizeSliderValue,
  renderSlider,
  type SliderCharacters,
  type SliderRangeOptions,
  type SliderValueContext,
} from '@/components/input/slider/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Slider adapter. */
export type SliderBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'keys' | 'mouse' | 'parent' | 'tags'
>;

/** Stateful data accepted by the Blessed {@link slider} adapter. */
export interface SliderData extends SliderRangeOptions {
  /** Character tokens used by the pure renderer. */
  characters?: SliderCharacters;

  /** Initial value for uncontrolled usage. Defaults to `min`. */
  defaultValue?: number;

  /** Whether focus and value changes are unavailable. */
  disabled?: boolean;

  /** Formats the text shown after the track. */
  formatValue?: (context: SliderValueContext) => string;

  /** Persistent, non-empty, single-line accessible label. */
  label: string;

  /** PageUp/PageDown increment. Defaults to ten `step` units. */
  largeStep?: number;

  /** Called after an interaction or imperative method requests a value change. */
  onValueChange?: (value: number) => void;

  /** Controlled value. */
  value?: number;

  /** Number of terminal cells reserved for the track, including the thumb. */
  width: number;
}

/** Options accepted by the Blessed {@link slider} adapter. */
export interface SliderOptions {
  /** Optional position, dimensions, style, and standard Blessed box settings. */
  box?: SliderBoxOptions;

  /** Label, range, value, formatting, and callback data. */
  data: SliderData;

  /** Blessed screen or node receiving the slider. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link slider}. */
export interface SliderHandle
  extends BlessedComponentHandle<SliderData, blessed.Widgets.BoxElement> {
  /** Decrements by `step` and reports whether the value changed. */
  decrement(): boolean;

  /** Gives terminal focus to an enabled slider. */
  focus(): void;

  /** Increments by `step` and reports whether the value changed. */
  increment(): boolean;

  /** Moves to the configured maximum and reports whether the value changed. */
  setToMax(): boolean;

  /** Moves to the configured minimum and reports whether the value changed. */
  setToMin(): boolean;

  /** Sets, clamps, and aligns an enabled value. */
  setValue(value: number): boolean;

  /** Returns the current controlled or uncontrolled normalized value. */
  value(): number;
}

interface Keypress {
  full?: string;
  name?: string;
}

interface MouseEvent {
  x?: number;
  y?: number;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function absoluteElementLeft(element: blessed.Widgets.BoxElement): number {
  const positionedElement = element as blessed.Widgets.BoxElement & {
    aleft?: blessed.Widgets.Types.TPosition;
  };

  return numericDimension(positionedElement.aleft ?? positionedElement.left);
}

function absoluteElementTop(element: blessed.Widgets.BoxElement): number {
  const positionedElement = element as blessed.Widgets.BoxElement & {
    atop?: blessed.Widgets.Types.TPosition;
  };

  return numericDimension(positionedElement.atop ?? positionedElement.top);
}

function removeFrom(
  elements: blessed.Widgets.BlessedElement[],
  element: blessed.Widgets.BoxElement,
): void {
  const index = elements.indexOf(element);

  if (index >= 0) {
    elements.splice(index, 1);
  }
}

/** Creates a keyboard and pointer accessible horizontal Slider backed by a Blessed box. */
export function slider({ box, data: initialData, parent }: SliderOptions): SliderHandle {
  let data = initialData;
  let focused = false;

  const initialRange: SliderRangeOptions = {
    ...(initialData.max === undefined ? {} : { max: initialData.max }),
    ...(initialData.min === undefined ? {} : { min: initialData.min }),
    ...(initialData.step === undefined ? {} : { step: initialData.step }),
  };

  let uncontrolledValue = normalizeSliderValue(
    initialData.defaultValue ?? initialData.min ?? 0,
    initialRange,
  );

  const element = blessed.box({
    ...box,
    content: '',
    keys: true,
    mouse: true,
    parent,
    tags: false,
  });
  const isControlled = (): boolean => Object.hasOwn(data, 'value');
  const currentRange = (): SliderRangeOptions => ({
    ...(data.max === undefined ? {} : { max: data.max }),
    ...(data.min === undefined ? {} : { min: data.min }),
    ...(data.step === undefined ? {} : { step: data.step }),
  });
  const currentValue = (): number =>
    normalizeSliderValue(
      isControlled() ? (data.value ?? data.min ?? 0) : uncontrolledValue,
      currentRange(),
    );
  const currentStep = (): number => data.step ?? 1;
  const currentLargeStep = (): number => {
    const largeStep = data.largeStep ?? currentStep() * 10;

    if (!Number.isFinite(largeStep) || largeStep <= 0) {
      throw new RangeError('Slider largeStep must be a positive finite number.');
    }

    return largeStep;
  };
  const render = (): void => {
    currentLargeStep();
    element.setContent(
      renderSlider({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        disabled: data.disabled === true,
        ...(data.formatValue === undefined ? {} : { formatValue: data.formatValue }),
        focused,
        label: data.label,
        ...(data.max === undefined ? {} : { max: data.max }),
        ...(data.min === undefined ? {} : { min: data.min }),
        ...(data.step === undefined ? {} : { step: data.step }),
        value: currentValue(),
        width: data.width,
      }),
    );
  };
  const syncInteraction = (): void => {
    if (data.disabled === true) {
      removeFrom(element.screen.clickable, element);
      removeFrom(element.screen.keyable, element);

      return;
    }

    element.enableInput();
  };
  const commitValue = (value: number): boolean => {
    if (data.disabled === true) {
      return false;
    }

    const normalizedValue = normalizeSliderValue(value, currentRange());

    if (Object.is(normalizedValue, currentValue())) {
      return false;
    }

    if (!isControlled()) {
      uncontrolledValue = normalizedValue;
    }

    data.onValueChange?.(normalizedValue);
    render();

    return true;
  };
  const adjust = (amount: number): boolean => commitValue(currentValue() + amount);
  const setFromPointer = (event: MouseEvent | undefined): boolean => {
    if (event?.x === undefined || data.disabled === true) {
      return false;
    }

    if (event.y !== undefined) {
      const row = event.y - absoluteElementTop(element) - numericDimension(element.itop);

      if (row !== 1) {
        return false;
      }
    }

    const column = event.x - absoluteElementLeft(element) - numericDimension(element.ileft) - 2;

    if (!Number.isInteger(column) || column < 0 || column >= data.width) {
      return false;
    }

    const min = data.min ?? 0;
    const max = data.max ?? 100;
    const ratio = data.width === 1 ? 0 : column / (data.width - 1);

    return commitValue(min + ratio * (max - min));
  };
  const handle: SliderHandle = {
    decrement() {
      return adjust(-currentStep());
    },
    destroy() {
      element.destroy();
    },
    element,
    focus() {
      if (data.disabled !== true) {
        element.focus();
      }
    },
    increment() {
      return adjust(currentStep());
    },
    setData(nextData) {
      const previousValue = currentValue();
      const wasControlled = isControlled();

      data = nextData;

      if (!isControlled()) {
        uncontrolledValue = normalizeSliderValue(
          wasControlled ? previousValue : uncontrolledValue,
          currentRange(),
        );
      }

      syncInteraction();
      render();
    },
    setToMax() {
      return commitValue(data.max ?? 100);
    },
    setToMin() {
      return commitValue(data.min ?? 0);
    },
    setValue: commitValue,
    value: currentValue,
  };

  element.on('blur', () => {
    focused = false;
    render();
  });
  element.on('click', (event: MouseEvent) => {
    handle.focus();
    setFromPointer(event);
  });
  element.on('focus', () => {
    focused = true;
    render();
  });
  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'down':
      case 'left':
        handle.decrement();
        break;
      case 'end':
        handle.setToMax();
        break;
      case 'home':
        handle.setToMin();
        break;
      case 'pagedown':
        adjust(-currentLargeStep());
        break;
      case 'pageup':
        adjust(currentLargeStep());
        break;
      case 'right':
      case 'up':
        handle.increment();
        break;
    }
  });
  element.on('resize', render);
  element.on('wheeldown', () => {
    handle.decrement();
  });
  element.on('wheelup', () => {
    handle.increment();
  });

  syncInteraction();
  render();

  return handle;
}
