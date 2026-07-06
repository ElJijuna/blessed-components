import blessed from 'blessed';

import {
  type PasswordFieldCharacters,
  renderPasswordField,
} from '@/components/input/password-field/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed textbox options supported by the PasswordField adapter. */
export type PasswordFieldBoxOptions = Omit<
  blessed.Widgets.TextboxOptions,
  'content' | 'keys' | 'mouse' | 'multiline' | 'parent' | 'tags' | 'value'
>;

/** Stateful data accepted by the Blessed {@link passwordField} adapter. */
export interface PasswordFieldData {
  /** Character tokens used by the pure renderer. */
  characters?: PasswordFieldCharacters;

  /** Initial reveal state for uncontrolled reveal usage. */
  defaultReveal?: boolean;

  /** Initial password value for uncontrolled usage. */
  defaultValue?: string;

  /** Whether focus and editing are unavailable. */
  disabled?: boolean;

  /** Error text. When present it takes precedence over `hint`. */
  error?: string;

  /** Hint text shown when no error is present. */
  hint?: string;

  /** Field label. */
  label: string;

  /** Called when reveal state changes through the imperative API or shortcut. */
  onRevealChange?: (reveal: boolean) => void;

  /** Called when the user or imperative API requests a submitted value. */
  onSubmit?: (value: string) => void;

  /** Called after user or imperative edits request a value change. */
  onValueChange?: (value: string) => void;

  /** Placeholder shown when value is empty. */
  placeholder?: string;

  /** Controlled reveal state. */
  reveal?: boolean;

  /** Whether the label should include a required indicator. */
  required?: boolean;

  /** Controlled password value. */
  value?: string;
}

/** Options accepted by the Blessed {@link passwordField} adapter. */
export interface PasswordFieldOptions {
  /** Position, dimensions, style, and standard Blessed textbox settings. */
  box?: PasswordFieldBoxOptions;

  /** Label, value, reveal, placeholder, hint, error, and callbacks. */
  data: PasswordFieldData;

  /** Blessed screen or node receiving the created textbox. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link passwordField}. */
export interface PasswordFieldHandle
  extends BlessedComponentHandle<PasswordFieldData, blessed.Widgets.TextboxElement> {
  /** Clears an enabled uncontrolled field and reports whether clearing occurred. */
  clear(): boolean;

  /** Gives terminal focus to an enabled password field. */
  focus(): void;

  /** Returns whether the password is currently revealed. */
  revealed(): boolean;

  /** Sets an enabled reveal state and reports whether it changed. */
  setReveal(reveal: boolean): boolean;

  /** Sets an enabled password value and reports whether editing occurred. */
  setValue(value: string): boolean;

  /** Submits the current value and reports whether submission occurred. */
  submit(): boolean;

  /** Toggles an enabled reveal state and reports whether it changed. */
  toggleReveal(): boolean;

  /** Returns the current controlled or uncontrolled password value. */
  value(): string;
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

/** Creates a single-line PasswordField backed by a Blessed textbox. */
export function passwordField({
  box,
  data: initialData,
  parent,
}: PasswordFieldOptions): PasswordFieldHandle {
  let data = initialData;
  let focused = false;
  let uncontrolledReveal = initialData.defaultReveal ?? false;
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
  const isRevealControlled = (): boolean => Object.hasOwn(data, 'reveal');
  const isValueControlled = (): boolean => Object.hasOwn(data, 'value');
  const currentReveal = (): boolean =>
    isRevealControlled() ? (data.reveal ?? false) : uncontrolledReveal;
  const currentValue = (): string => (isValueControlled() ? (data.value ?? '') : uncontrolledValue);
  const viewportSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const render = (): void => {
    const dimensions = viewportSize();

    element.setContent(
      renderPasswordField({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        disabled: data.disabled === true,
        ...(data.error === undefined ? {} : { error: data.error }),
        focused,
        height: dimensions.height,
        ...(data.hint === undefined ? {} : { hint: data.hint }),
        label: data.label,
        ...(data.placeholder === undefined ? {} : { placeholder: data.placeholder }),
        reveal: currentReveal(),
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
  const commitReveal = (nextReveal: boolean): boolean => {
    if (data.disabled === true) {
      return false;
    }

    if (!isRevealControlled()) {
      uncontrolledReveal = nextReveal;
    }

    data.onRevealChange?.(nextReveal);
    render();

    return true;
  };
  const commitValue = (nextValue: string): boolean => {
    if (data.disabled === true) {
      return false;
    }

    if (!isValueControlled()) {
      uncontrolledValue = nextValue;
    }

    data.onValueChange?.(nextValue);
    syncBlessedValue();
    render();

    return true;
  };
  const handle: PasswordFieldHandle = {
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
    revealed: currentReveal,
    setData(nextData) {
      data = nextData;

      if (!isValueControlled() && nextData.defaultValue !== undefined) {
        uncontrolledValue = nextData.defaultValue;
      }

      if (!isRevealControlled() && nextData.defaultReveal !== undefined) {
        uncontrolledReveal = nextData.defaultReveal;
      }

      syncInteraction();
      syncBlessedValue();
      render();
    },
    setReveal(reveal) {
      return commitReveal(reveal);
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
    toggleReveal() {
      return commitReveal(!currentReveal());
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
    if ((key.full ?? key.name) === 'C-r') {
      handle.toggleReveal();
    }
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
