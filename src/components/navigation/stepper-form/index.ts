import type { FormErrors, FormValues } from '@/components/input/form/index.js';

/** One step in a {@link createStepperFormState} flow. */
export interface StepperFormStep {
  /** Field ids validated when leaving this step. */
  fields?: readonly string[];
  /** Stable step identifier. */
  id: string;
  /** Human-readable step label. */
  label: string;
  /** Optional step-level validation. */
  validate?: (values: FormValues) => FormErrors | string | undefined;
}

/** Why a StepperForm transition was rejected. */
export type StepperFormBlockReason = 'invalid' | 'out-of-range';

/** Result of a StepperForm navigation request. */
export type StepperFormNavigationResult =
  | { errors: FormErrors; ok: false; reason: StepperFormBlockReason; stepId: string }
  | { completed: boolean; ok: true; stepId: string };

/** Options accepted by {@link createStepperFormState}. */
export interface CreateStepperFormStateOptions {
  /** Initial step id for uncontrolled state. */
  defaultStepId?: string;
  /** Returns current form values. */
  getValues: () => FormValues;
  /** Called after the final step passes validation. */
  onComplete?: (values: FormValues) => void;
  /** Called when a navigation request is blocked by validation. */
  onInvalid?: (stepId: string, errors: FormErrors) => void;
  /** Called after the active step changes. */
  onStepChange?: (stepId: string, previousStepId: string) => void;
  /** Ordered, non-empty steps. */
  steps: readonly StepperFormStep[];
  /** Validates registered fields and returns errors keyed by field id. */
  validate?: (fieldIds: readonly string[], values: FormValues) => FormErrors;
}

/** Framework-independent multi-step form state. */
export interface StepperFormStateModel {
  /** Current zero-based step index. */
  activeIndex(): number;
  /** Current step. */
  activeStep(): StepperFormStep;
  /** Completes the flow when the final step is valid. */
  complete(): StepperFormNavigationResult;
  /** Moves directly to a step; forward moves validate the current step. */
  goTo(stepId: string): StepperFormNavigationResult;
  /** Whether a previous step exists. */
  hasPrevious(): boolean;
  /** Whether the active step is the final step. */
  isLast(): boolean;
  /** Validates and advances, or completes from the final step. */
  next(): StepperFormNavigationResult;
  /** Moves back without validation. */
  previous(): StepperFormNavigationResult;
  /** Replaces callbacks and step definitions while preserving the active id when possible. */
  setOptions(options: CreateStepperFormStateOptions): void;
  /** Validates the active step. */
  validate(): FormErrors;
}

function assertSteps(steps: readonly StepperFormStep[]): void {
  if (steps.length === 0) {
    throw new RangeError('StepperForm steps must be non-empty.');
  }

  const ids = new Set<string>();

  for (const step of steps) {
    if (step.id.trim().length === 0 || step.label.trim().length === 0 || /[\r\n]/u.test(step.id)) {
      throw new RangeError('StepperForm step ids and labels must be non-empty.');
    }

    if (ids.has(step.id)) {
      throw new RangeError(`StepperForm step ids must be unique: ${step.id}.`);
    }

    ids.add(step.id);
  }
}

/** Creates guarded state for a multi-step form flow. */
export function createStepperFormState(
  initialOptions: CreateStepperFormStateOptions,
): StepperFormStateModel {
  assertSteps(initialOptions.steps);

  let options = initialOptions;
  let activeId = initialOptions.defaultStepId ?? initialOptions.steps[0]?.id ?? '';

  if (!initialOptions.steps.some(({ id }) => id === activeId)) {
    throw new RangeError(`StepperForm default step does not exist: ${activeId}.`);
  }

  const activeIndex = (): number => options.steps.findIndex(({ id }) => id === activeId);
  const activeStep = (): StepperFormStep => options.steps[activeIndex()] as StepperFormStep;
  const success = (completed = false): StepperFormNavigationResult => ({
    completed,
    ok: true,
    stepId: activeId,
  });
  const validate = (): FormErrors => {
    const step = activeStep();
    const values = options.getValues();
    const errors = { ...(options.validate?.(step.fields ?? [], values) ?? {}) };
    const stepError = step.validate?.(values);

    if (typeof stepError === 'string' && stepError.length > 0) {
      errors[step.id] = stepError;
    } else if (stepError !== undefined && typeof stepError !== 'string') {
      Object.assign(errors, stepError);
    }

    return errors;
  };
  const blocked = (errors: FormErrors): StepperFormNavigationResult => {
    options.onInvalid?.(activeId, errors);

    return { errors, ok: false, reason: 'invalid', stepId: activeId };
  };
  const move = (nextId: string): StepperFormNavigationResult => {
    const previousId = activeId;

    activeId = nextId;
    options.onStepChange?.(activeId, previousId);

    return success();
  };

  return {
    activeIndex,
    activeStep,
    complete() {
      const errors = validate();

      if (Object.keys(errors).length > 0) {
        return blocked(errors);
      }

      if (activeIndex() !== options.steps.length - 1) {
        return { errors: {}, ok: false, reason: 'out-of-range', stepId: activeId };
      }

      options.onComplete?.(options.getValues());

      return success(true);
    },
    goTo(stepId) {
      const nextIndex = options.steps.findIndex(({ id }) => id === stepId);

      if (nextIndex < 0) {
        return { errors: {}, ok: false, reason: 'out-of-range', stepId: activeId };
      }

      if (nextIndex > activeIndex()) {
        const errors = validate();

        if (Object.keys(errors).length > 0) {
          return blocked(errors);
        }
      }

      return stepId === activeId ? success() : move(stepId);
    },
    hasPrevious: () => activeIndex() > 0,
    isLast: () => activeIndex() === options.steps.length - 1,
    next() {
      if (activeIndex() === options.steps.length - 1) {
        return this.complete();
      }

      const errors = validate();

      if (Object.keys(errors).length > 0) {
        return blocked(errors);
      }

      return move((options.steps[activeIndex() + 1] as StepperFormStep).id);
    },
    previous() {
      if (activeIndex() === 0) {
        return { errors: {}, ok: false, reason: 'out-of-range', stepId: activeId };
      }

      return move((options.steps[activeIndex() - 1] as StepperFormStep).id);
    },
    setOptions(nextOptions) {
      assertSteps(nextOptions.steps);
      options = nextOptions;

      if (!options.steps.some(({ id }) => id === activeId)) {
        activeId = options.defaultStepId ?? options.steps[0]?.id ?? '';
      }

      if (!options.steps.some(({ id }) => id === activeId)) {
        throw new RangeError(`StepperForm default step does not exist: ${activeId}.`);
      }
    },
    validate,
  };
}
