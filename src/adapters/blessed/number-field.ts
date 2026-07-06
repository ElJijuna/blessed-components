import blessed from 'blessed';

import {
  clampNumberFieldValue,
  type NumberFieldCharacters,
  type NumberFieldParseOptions,
  parseNumberFieldInput,
  renderNumberField,
} from '@/components/input/number-field/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed textbox options supported by the NumberField adapter. */
export type NumberFieldBoxOptions = Omit<
  blessed.Widgets.TextboxOptions,
  'content' | 'keys' | 'mouse' | 'multiline' | 'parent' | 'tags' | 'value'
>;

/** Stateful data accepted by the Blessed {@link numberField} adapter. */
export interface NumberFieldData {
  /** Character tokens used by the pure renderer. */
  characters?: NumberFieldCharacters;

  /** Initial numeric value for uncontrolled usage. */
  defaultValue?: number;

  /** Whether focus and editing are unavailable. */
  disabled?: boolean;

  /** Error text. When present it takes precedence over `hint`. */
  error?: string;

  /** Hint text shown when no error is present. */
  hint?: string;

  /** Field label. */
  label: string;

  /** Inclusive maximum accepted value. */
  max?: number | undefined;

  /** Inclusive minimum accepted value. */
  min?: number | undefined;

  /** Called when parsing user text fails. */
  onInvalidInput?: (input: string, reason: 'empty' | 'invalid' | 'below-min' | 'above-max') => void;

  /** Called when the user or imperative API requests a submitted value. */
  onSubmit?: (value: number) => void;

  /** Called after user or imperative edits request a value change. */
  onValueChange?: (value: number | undefined) => void;

  /** Placeholder shown when value is empty. */
  placeholder?: string;

  /** Whether the label should include a required indicator. */
  required?: boolean;

  /** Whether to show decrement/increment affordances. */
  showStepper?: boolean;

  /** Increment/decrement amount. */
  step?: number | undefined;

  /** Controlled numeric value. */
  value?: number;
}

/** Options accepted by the Blessed {@link numberField} adapter. */
export interface NumberFieldOptions {
  /** Position, dimensions, style, and standard Blessed textbox settings. */
  box?: NumberFieldBoxOptions;

  /** Label, value, bounds, step, placeholder, hint, error, and callbacks. */
  data: NumberFieldData;

  /** Blessed screen or node receiving the created textbox. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link numberField}. */
export interface NumberFieldHandle
  extends BlessedComponentHandle<NumberFieldData, blessed.Widgets.TextboxElement> {
  /** Clears an enabled uncontrolled field and reports whether clearing occurred. */
  clear(): boolean;

  /** Decrements by `step` within bounds and reports whether editing occurred. */
  decrement(): boolean;

  /** Gives terminal focus to an enabled number field. */
  focus(): void;

  /** Increments by `step` within bounds and reports whether editing occurred. */
  increment(): boolean;

  /** Parses and sets an enabled text input and reports whether editing occurred. */
  setInput(input: string): boolean;

  /** Sets an enabled numeric value and reports whether editing occurred. */
  setValue(value: number | undefined): boolean;

  /** Submits the current value and reports whether submission occurred. */
  submit(): boolean;

  /** Returns the current controlled or uncontrolled numeric value. */
  value(): number | undefined;
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
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

function stringifyValue(value: number | undefined): string {
  return value === undefined ? '' : String(value);
}

/** Creates a single-line NumberField backed by a Blessed textbox. */
export function numberField({
  box,
  data: initialData,
  parent,
}: NumberFieldOptions): NumberFieldHandle {
  let data = initialData;
  let focused = false;
  let uncontrolledValue = initialData.defaultValue;

  const element = blessed.textbox({
    ...box,
    inputOnFocus: true,
    keys: true,
    mouse: true,
    multiline: false,
    parent,
    tags: false,
    value: stringifyValue(initialData.value ?? uncontrolledValue),
  });
  const isControlled = (): boolean => Object.hasOwn(data, 'value');
  const currentValue = (): number | undefined => (isControlled() ? data.value : uncontrolledValue);
  const currentStep = (): number => data.step ?? 1;
  const currentBounds = (): NumberFieldParseOptions => ({
    ...(data.max === undefined ? {} : { max: data.max }),
    ...(data.min === undefined ? {} : { min: data.min }),
  });
  const viewportSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const render = (): void => {
    const dimensions = viewportSize();

    element.setContent(
      renderNumberField({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        disabled: data.disabled === true,
        ...(data.error === undefined ? {} : { error: data.error }),
        focused,
        height: dimensions.height,
        ...(data.hint === undefined ? {} : { hint: data.hint }),
        label: data.label,
        ...(data.max === undefined ? {} : { max: data.max }),
        ...(data.min === undefined ? {} : { min: data.min }),
        ...(data.placeholder === undefined ? {} : { placeholder: data.placeholder }),
        ...(data.required === undefined ? {} : { required: data.required }),
        ...(data.showStepper === undefined ? {} : { showStepper: data.showStepper }),
        ...(data.step === undefined ? {} : { step: data.step }),
        ...(currentValue() === undefined ? {} : { value: currentValue() }),
        width: dimensions.width,
      }),
    );
  };
  const syncBlessedValue = (): void => {
    const value = stringifyValue(currentValue());

    if (element.getValue() !== value) {
      element.setValue(value);
    }
  };
  const syncInteraction = (): void => {
    if (data.disabled === true) {
      removeFrom(element.screen.clickable, element);
      removeFrom(element.screen.keyable, element);

      return;
    }

    element.enableInput();
  };
  const commitValue = (nextValue: number | undefined): boolean => {
    if (data.disabled === true) {
      return false;
    }

    const normalizedValue =
      nextValue === undefined ? undefined : clampNumberFieldValue(nextValue, currentBounds());

    if (!isControlled()) {
      uncontrolledValue = normalizedValue;
    }

    data.onValueChange?.(normalizedValue);
    syncBlessedValue();
    render();

    return true;
  };
  const commitInput = (input: string): boolean => {
    if (data.disabled === true) {
      return false;
    }

    const result = parseNumberFieldInput(input, currentBounds());

    if (!result.valid) {
      data.onInvalidInput?.(result.input, result.reason);
      syncBlessedValue();
      render();

      return false;
    }

    return commitValue(result.value);
  };
  const stepValue = (direction: -1 | 1): boolean => {
    const baseValue = currentValue() ?? data.min ?? 0;
    const nextValue = clampNumberFieldValue(baseValue + currentStep() * direction, currentBounds());

    return commitValue(nextValue);
  };
  const handle: NumberFieldHandle = {
    clear() {
      return commitValue(undefined);
    },
    decrement() {
      return stepValue(-1);
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
      return stepValue(1);
    },
    setData(nextData) {
      data = nextData;

      if (!isControlled() && nextData.defaultValue !== undefined) {
        uncontrolledValue = nextData.defaultValue;
      }

      syncInteraction();
      syncBlessedValue();
      render();
    },
    setInput(input) {
      return commitInput(input);
    },
    setValue(value) {
      return commitValue(value);
    },
    submit() {
      const value = currentValue();

      if (data.disabled === true || value === undefined) {
        return false;
      }

      data.onSubmit?.(value);

      return true;
    },
    value: currentValue,
  };

  element.on('blur', () => {
    focused = false;
    syncBlessedValue();
    render();
  });
  element.on('focus', () => {
    focused = true;
    syncBlessedValue();
    render();
  });
  element.on('keypress', (_character: string, key: Keypress) => {
    const name = key.full ?? key.name;

    if (name === 'up') {
      handle.increment();
    } else if (name === 'down') {
      handle.decrement();
    }
  });
  element.on('submit', (input: string) => {
    if (commitInput(input)) {
      handle.submit();
    }
  });
  element.on('cancel', () => {
    syncBlessedValue();
    render();
  });
  element.on('resize', render);

  syncInteraction();
  syncBlessedValue();
  render();

  return handle;
}
