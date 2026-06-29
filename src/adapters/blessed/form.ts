import blessed from 'blessed';

import {
  type CreateFormStateOptions,
  createFormState,
  type FormErrors,
  type FormFieldDefinition,
  type FormSubmitResult,
  type FormValues,
} from '@/components/input/form/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed form options supported by the Form adapter. */
export type FormBoxOptions = Omit<blessed.Widgets.FormOptions, 'parent'>;

/** Field binding accepted by the Blessed {@link form} adapter. */
export interface FormFieldBinding extends Omit<FormFieldDefinition, 'value'> {
  /** Returns the current field value. */
  getValue: () => unknown;

  /** Resets the bound field element. */
  reset?: () => void;

  /** Sets the bound field value after Form reset. */
  setValue?: (value: unknown) => boolean | undefined;
}

/** Stateful data accepted by the Blessed {@link form} adapter. */
export interface FormData extends Omit<CreateFormStateOptions, 'fields'> {
  /** Initial registered field bindings. */
  fields?: FormFieldBinding[];
}

/** Options accepted by the Blessed {@link form} adapter. */
export interface FormOptions {
  /** Position, dimensions, style, and standard Blessed form settings. */
  box?: FormBoxOptions;

  /** Field bindings and submit/reset/validation callbacks. */
  data?: FormData;

  /** Blessed screen or node receiving the form container. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link form}. */
export interface FormHandle
  extends BlessedComponentHandle<FormData, blessed.Widgets.FormElement<FormValues>> {
  /** Returns current validation errors. */
  errors(): FormErrors;

  /** Focuses the next child form element. */
  focusNext(): void;

  /** Focuses the previous child form element. */
  focusPrevious(): void;

  /** Registers one field binding. */
  registerField(field: FormFieldBinding): void;

  /** Resets fields and returns current values. */
  reset(): FormValues;

  /** Submits the form and returns validation result. */
  submit(): FormSubmitResult;

  /** Removes one field binding. */
  unregisterField(id: string): void;

  /** Validates current values. */
  validate(): FormErrors;

  /** Returns current values. */
  values(): FormValues;
}

function toStateField(binding: FormFieldBinding): FormFieldDefinition {
  return {
    ...(binding.defaultValue === undefined ? {} : { defaultValue: binding.defaultValue }),
    id: binding.id,
    ...(binding.onValueChange === undefined ? {} : { onValueChange: binding.onValueChange }),
    value: binding.getValue(),
    ...(binding.validate === undefined ? {} : { validate: binding.validate }),
  };
}

function stateOptions(data: FormData, fields: FormFieldBinding[]): CreateFormStateOptions {
  return {
    fields: fields.map(toStateField),
    ...(data.onReset === undefined ? {} : { onReset: data.onReset }),
    ...(data.onSubmit === undefined ? {} : { onSubmit: data.onSubmit }),
    ...(data.onValidation === undefined ? {} : { onValidation: data.onValidation }),
  };
}

/** Creates a Blessed form container backed by the shared Form state model. */
export function form({ box, data: initialData = {}, parent }: FormOptions): FormHandle {
  let data = initialData;

  const bindings = new Map<string, FormFieldBinding>();
  const state = createFormState(stateOptions(data, []));
  const element = blessed.form<FormValues>({
    keys: true,
    ...box,
    parent,
  });
  const resetBindings = (): void => {
    for (const binding of bindings.values()) {
      if (binding.reset !== undefined) {
        binding.reset();
      } else if (binding.setValue !== undefined) {
        binding.setValue(binding.defaultValue);
      }
    }
  };
  const configureState = (): void => {
    state.setOptions(stateOptions(data, [...bindings.values()]));
  };
  const handle: FormHandle = {
    destroy() {
      element.destroy();
    },
    element,
    errors() {
      return state.errors();
    },
    focusNext() {
      element.focusNext();
    },
    focusPrevious() {
      element.focusPrevious();
    },
    registerField(field) {
      if (bindings.has(field.id)) {
        throw new RangeError(`Form field id "${field.id}" is already registered.`);
      }

      bindings.set(field.id, field);
      configureState();
    },
    reset() {
      resetBindings();
      configureState();

      const values = state.reset();

      return values;
    },
    setData(nextData) {
      data = nextData;
      bindings.clear();

      for (const field of nextData.fields ?? []) {
        bindings.set(field.id, field);
      }

      configureState();
    },
    submit() {
      configureState();

      return state.submit();
    },
    unregisterField(id) {
      bindings.delete(id);
      state.unregisterField(id);
    },
    validate() {
      configureState();

      return state.validate();
    },
    values() {
      configureState();

      return state.values();
    },
  };

  for (const field of data.fields ?? []) {
    handle.registerField(field);
  }

  element.on('submit', () => {
    handle.submit();
  });
  element.on('reset', () => {
    handle.reset();
  });

  return handle;
}
