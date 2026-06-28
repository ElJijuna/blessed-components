import blessed from 'blessed';

import { renderTextField, type TextFieldCharacters } from '@/components/input/text-field/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed textbox options supported by the TextField adapter. */
export type TextFieldBoxOptions = Omit<
  blessed.Widgets.TextboxOptions,
  'content' | 'keys' | 'mouse' | 'multiline' | 'parent' | 'tags' | 'value'
>;

/** Stateful data accepted by the Blessed {@link textField} adapter. */
export interface TextFieldData {
  /** Character tokens used by the pure renderer. */
  characters?: TextFieldCharacters;

  /** Initial text value for uncontrolled usage. */
  defaultValue?: string;

  /** Whether focus and editing are unavailable. */
  disabled?: boolean;

  /** Error text. When present it takes precedence over `hint`. */
  error?: string;

  /** Hint text shown when no error is present. */
  hint?: string;

  /** Field label. */
  label: string;

  /** Called when the user or imperative API requests a submitted value. */
  onSubmit?: (value: string) => void;

  /** Called after user or imperative edits request a value change. */
  onValueChange?: (value: string) => void;

  /** Placeholder shown when value is empty. */
  placeholder?: string;

  /** Whether the label should include a required indicator. */
  required?: boolean;

  /** Controlled text value. */
  value?: string;
}

/** Options accepted by the Blessed {@link textField} adapter. */
export interface TextFieldOptions {
  /** Position, dimensions, style, and standard Blessed textbox settings. */
  box?: TextFieldBoxOptions;

  /** Label, value, placeholder, hint, error, and callbacks. */
  data: TextFieldData;

  /** Blessed screen or node receiving the created textbox. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link textField}. */
export interface TextFieldHandle
  extends BlessedComponentHandle<TextFieldData, blessed.Widgets.TextboxElement> {
  /** Clears an enabled uncontrolled field and reports whether clearing occurred. */
  clear(): boolean;

  /** Gives terminal focus to an enabled text field. */
  focus(): void;

  /** Sets an enabled text value and reports whether editing occurred. */
  setValue(value: string): boolean;

  /** Submits the current value and reports whether submission occurred. */
  submit(): boolean;

  /** Returns the current controlled or uncontrolled text value. */
  value(): string;
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

/** Creates a single-line TextField backed by a Blessed textbox. */
export function textField({ box, data: initialData, parent }: TextFieldOptions): TextFieldHandle {
  let data = initialData;
  let focused = false;
  let uncontrolledValue = initialData.defaultValue ?? '';

  const element = blessed.textbox({
    ...box,
    inputOnFocus: true,
    keys: true,
    mouse: true,
    multiline: false,
    parent,
    tags: false,
    value: initialData.value ?? uncontrolledValue,
  });
  const isControlled = (): boolean => Object.hasOwn(data, 'value');
  const currentValue = (): string => (isControlled() ? (data.value ?? '') : uncontrolledValue);
  const viewportSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const render = (): void => {
    const dimensions = viewportSize();

    element.setContent(
      renderTextField({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        disabled: data.disabled === true,
        ...(data.error === undefined ? {} : { error: data.error }),
        focused,
        height: dimensions.height,
        ...(data.hint === undefined ? {} : { hint: data.hint }),
        label: data.label,
        ...(data.placeholder === undefined ? {} : { placeholder: data.placeholder }),
        ...(data.required === undefined ? {} : { required: data.required }),
        value: currentValue(),
        width: dimensions.width,
      }),
    );
  };
  const syncBlessedValue = (): void => {
    const value = currentValue();

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
  const commitValue = (nextValue: string): boolean => {
    if (data.disabled === true) {
      return false;
    }

    if (!isControlled()) {
      uncontrolledValue = nextValue;
    }

    data.onValueChange?.(nextValue);
    syncBlessedValue();
    render();

    return true;
  };
  const handle: TextFieldHandle = {
    clear() {
      return commitValue('');
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
    setData(nextData) {
      data = nextData;

      if (!isControlled() && nextData.defaultValue !== undefined) {
        uncontrolledValue = nextData.defaultValue;
      }

      syncInteraction();
      syncBlessedValue();
      render();
    },
    setValue(value) {
      return commitValue(value);
    },
    submit() {
      if (data.disabled === true) {
        return false;
      }

      data.onSubmit?.(currentValue());

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
  element.on('submit', (value: string) => {
    commitValue(value);
    data.onSubmit?.(currentValue());
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
