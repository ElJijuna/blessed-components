/** Field values keyed by stable field id. */
export type FormValues = Record<string, unknown>;

/** Field errors keyed by stable field id. */
export type FormErrors = Record<string, string>;

/** Result returned by {@link FormStateModel.submit}. */
export type FormSubmitResult =
  | {
      /** Validation errors by field id. */
      errors: FormErrors;

      /** Whether submission passed validation. */
      ok: false;

      /** Current field values. */
      values: FormValues;
    }
  | {
      /** Whether submission passed validation. */
      ok: true;

      /** Submitted field values. */
      values: FormValues;
    };

/** Options used to register one field with {@link createFormState}. */
export interface FormFieldDefinition {
  /** Initial value used by uncontrolled reset. */
  defaultValue?: unknown;

  /** Stable field id. */
  id: string;

  /** Called when a field value changes. */
  onValueChange?: (value: unknown, values: FormValues) => void;

  /** Controlled field value. */
  value?: unknown;

  /** Returns an error message when the current value is invalid. */
  validate?: (value: unknown, values: FormValues) => string | undefined;
}

/** Options accepted by {@link createFormState}. */
export interface CreateFormStateOptions {
  /** Initial registered fields. */
  fields?: FormFieldDefinition[];

  /** Called after reset. */
  onReset?: (values: FormValues) => void;

  /** Called when submit passes validation. */
  onSubmit?: (values: FormValues) => void;

  /** Called after validation. */
  onValidation?: (errors: FormErrors, values: FormValues) => void;
}

/** Controlled or uncontrolled form registry and validation model. */
export interface FormStateModel {
  /** Returns current validation errors. */
  errors(): FormErrors;

  /** Returns one field value. */
  fieldValue(id: string): unknown;

  /** Registers one field. */
  registerField(field: FormFieldDefinition): void;

  /** Resets uncontrolled fields to defaults and returns current values. */
  reset(): FormValues;

  /** Replaces callbacks and field definitions. */
  setOptions(options: CreateFormStateOptions): void;

  /** Sets a field value and reports whether the field exists. */
  setValue(id: string, value: unknown): boolean;

  /** Validates and submits current values. */
  submit(): FormSubmitResult;

  /** Removes one field. */
  unregisterField(id: string): void;

  /** Validates current values and returns errors. */
  validate(): FormErrors;

  /** Returns current values. */
  values(): FormValues;
}

function hasOwn(object: object, key: PropertyKey): boolean {
  return Object.hasOwn(object, key);
}

function assertValidId(id: string): void {
  if (id.length === 0 || /[\r\n]/u.test(id)) {
    throw new RangeError('Form field id must be non-empty and fit on one line.');
  }
}

function copyErrors(errors: Map<string, string>): FormErrors {
  return Object.fromEntries(errors.entries());
}

/** Creates a deterministic form registry with validation, reset, and submit. */
export function createFormState(initialOptions: CreateFormStateOptions = {}): FormStateModel {
  let options = initialOptions;

  const fields = new Map<string, FormFieldDefinition>();
  const uncontrolledValues = new Map<string, unknown>();
  const errors = new Map<string, string>();
  const isControlled = (field: FormFieldDefinition): boolean => hasOwn(field, 'value');
  const currentValue = (field: FormFieldDefinition): unknown =>
    isControlled(field) ? field.value : uncontrolledValues.get(field.id);
  const values = (): FormValues =>
    Object.fromEntries([...fields.values()].map((field) => [field.id, currentValue(field)]));
  const registerField = (field: FormFieldDefinition): void => {
    assertValidId(field.id);

    if (fields.has(field.id)) {
      throw new RangeError(`Form field id "${field.id}" is already registered.`);
    }

    fields.set(field.id, field);
    uncontrolledValues.set(field.id, isControlled(field) ? field.value : field.defaultValue);
  };
  const replaceField = (field: FormFieldDefinition): void => {
    assertValidId(field.id);

    const previous = fields.get(field.id);

    fields.set(field.id, field);

    if (previous === undefined || isControlled(field)) {
      uncontrolledValues.set(field.id, isControlled(field) ? field.value : field.defaultValue);
    }
  };

  for (const field of initialOptions.fields ?? []) {
    registerField(field);
  }

  return {
    errors() {
      return copyErrors(errors);
    },
    fieldValue(id) {
      const field = fields.get(id);

      return field === undefined ? undefined : currentValue(field);
    },
    registerField,
    reset() {
      errors.clear();

      for (const field of fields.values()) {
        if (!isControlled(field)) {
          uncontrolledValues.set(field.id, field.defaultValue);
        }
      }

      const nextValues = values();

      options.onReset?.(nextValues);

      return nextValues;
    },
    setOptions(nextOptions) {
      options = nextOptions;

      if (nextOptions.fields !== undefined) {
        const nextIds = new Set(nextOptions.fields.map((field) => field.id));

        for (const id of fields.keys()) {
          if (!nextIds.has(id)) {
            fields.delete(id);
            uncontrolledValues.delete(id);
            errors.delete(id);
          }
        }

        for (const field of nextOptions.fields) {
          replaceField(field);
        }
      }
    },
    setValue(id, value) {
      const field = fields.get(id);

      if (field === undefined) {
        return false;
      }

      if (!isControlled(field)) {
        uncontrolledValues.set(id, value);
      }

      field.onValueChange?.(value, values());

      return true;
    },
    submit() {
      const nextErrors = this.validate();
      const nextValues = values();

      if (Object.keys(nextErrors).length > 0) {
        return {
          errors: nextErrors,
          ok: false,
          values: nextValues,
        };
      }

      options.onSubmit?.(nextValues);

      return {
        ok: true,
        values: nextValues,
      };
    },
    unregisterField(id) {
      fields.delete(id);
      uncontrolledValues.delete(id);
      errors.delete(id);
    },
    validate() {
      errors.clear();

      const currentValues = values();

      for (const field of fields.values()) {
        const error = field.validate?.(currentValues[field.id], currentValues);

        if (error !== undefined && error.length > 0) {
          errors.set(field.id, error);
        }
      }

      const nextErrors = copyErrors(errors);

      options.onValidation?.(nextErrors, currentValues);

      return nextErrors;
    },
    values,
  };
}
