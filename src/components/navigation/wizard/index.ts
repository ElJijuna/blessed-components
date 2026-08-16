import {
  renderStepIndicator,
  STEP_INDICATOR_UNICODE_MARKERS,
  type StepIndicatorMarkers,
} from '@/components/feedback/step-indicator/index.js';
import { renderPlainLines } from '@/components/shared/text.js';

/** Lifecycle state of a Wizard flow. */
export type WizardStatus = 'active' | 'cancelled' | 'completed';

/** Context passed to a step's forward-navigation guard. */
export interface WizardGuardContext {
  /** Current zero-based step index. */
  activeIndex: number;
  /** Current step. */
  step: WizardStep;
  /** Ordered Wizard steps. */
  steps: readonly WizardStep[];
}

/** A page in a guided Wizard flow. */
export interface WizardStep {
  /** Returns `false` or an explanatory message to block forward navigation. */
  canAdvance?: (context: WizardGuardContext) => boolean | string;
  /** Body content rendered for this step. */
  content?: readonly string[] | string;
  /** Optional supporting text rendered below the title. */
  description?: string;
  /** Stable step identifier. */
  id: string;
  /** Short label used by the progress indicator. */
  label: string;
  /** Page heading. Defaults to `label`. */
  title?: string;
}

/** Why a Wizard request was rejected. */
export type WizardBlockReason = 'blocked' | 'finished' | 'out-of-range';

/** Result of a Wizard navigation, cancellation, or completion request. */
export type WizardActionResult =
  | {
      action: 'cancel' | 'complete' | 'navigate';
      ok: true;
      status: WizardStatus;
      stepId: string;
    }
  | {
      message?: string;
      ok: false;
      reason: WizardBlockReason;
      status: WizardStatus;
      stepId: string;
    };

/** Options accepted by {@link createWizardState}. */
export interface CreateWizardStateOptions {
  /** Initial step id. Defaults to the first step. */
  defaultStepId?: string;
  /** Called once when the flow is cancelled. */
  onCancel?: (step: WizardStep) => void;
  /** Called once when the final step completes. */
  onComplete?: (step: WizardStep) => void;
  /** Called after active-step changes. */
  onStepChange?: (stepId: string, previousStepId: string) => void;
  /** Ordered, non-empty Wizard pages. */
  steps: readonly WizardStep[];
}

/** Framework-independent guided-flow state. */
export interface WizardStateModel {
  /** Current zero-based step index. */
  activeIndex(): number;
  /** Current step. */
  activeStep(): WizardStep;
  /** Cancels an active flow. */
  cancel(): WizardActionResult;
  /** Completes an active flow from its final step. */
  complete(): WizardActionResult;
  /** Moves directly to a step; forward moves run the current step guard. */
  goTo(stepId: string): WizardActionResult;
  /** Whether a previous step exists. */
  hasPrevious(): boolean;
  /** Whether the active step is the final step. */
  isLast(): boolean;
  /** Advances, or completes from the final step. */
  next(): WizardActionResult;
  /** Moves back without running the current step guard. */
  previous(): WizardActionResult;
  /** Restarts the flow at its configured default step. */
  reset(): WizardActionResult;
  /** Replaces callbacks and steps while preserving the active id when possible. */
  setOptions(options: CreateWizardStateOptions): void;
  /** Current lifecycle state. */
  status(): WizardStatus;
}

/** Labels used by {@link renderWizard}. */
export interface WizardLabels {
  back?: string;
  cancel?: string;
  complete?: string;
  next?: string;
}

/** Options accepted by {@link renderWizard}. */
export interface RenderWizardOptions {
  /** Active zero-based step index. */
  activeIndex?: number;
  /** Maximum rendered height. */
  height?: number;
  /** Footer labels. */
  labels?: WizardLabels;
  /** Step-indicator markers. */
  markers?: StepIndicatorMarkers;
  /** Ordered, non-empty Wizard pages. */
  steps: readonly WizardStep[];
  /** Maximum terminal-cell width. */
  width?: number;
}

function assertSteps(steps: readonly WizardStep[]): void {
  if (steps.length === 0) {
    throw new RangeError('Wizard steps must be non-empty.');
  }

  const ids = new Set<string>();

  for (const step of steps) {
    if (step.id.trim().length === 0 || step.label.trim().length === 0 || /[\r\n]/u.test(step.id)) {
      throw new RangeError('Wizard step ids and labels must be non-empty.');
    }

    if (ids.has(step.id)) {
      throw new RangeError(`Wizard step ids must be unique: ${step.id}.`);
    }

    ids.add(step.id);
  }
}

function assertDefaultStep(options: CreateWizardStateOptions): void {
  if (
    options.defaultStepId !== undefined &&
    !options.steps.some(({ id }) => id === options.defaultStepId)
  ) {
    throw new RangeError(`Wizard default step does not exist: ${options.defaultStepId}.`);
  }
}

/** Creates guarded state for a guided Wizard flow. */
export function createWizardState(initialOptions: CreateWizardStateOptions): WizardStateModel {
  assertSteps(initialOptions.steps);
  assertDefaultStep(initialOptions);

  let options = initialOptions;
  let activeId = initialOptions.defaultStepId ?? initialOptions.steps[0]?.id ?? '';
  let lifecycle: WizardStatus = 'active';

  const activeIndex = (): number => options.steps.findIndex(({ id }) => id === activeId);
  const activeStep = (): WizardStep => options.steps[activeIndex()] as WizardStep;
  const rejected = (reason: WizardBlockReason, message?: string): WizardActionResult => ({
    ...(message === undefined ? {} : { message }),
    ok: false,
    reason,
    status: lifecycle,
    stepId: activeId,
  });
  const succeeded = (action: 'cancel' | 'complete' | 'navigate'): WizardActionResult => ({
    action,
    ok: true,
    status: lifecycle,
    stepId: activeId,
  });
  const ensureActive = (): WizardActionResult | undefined =>
    lifecycle === 'active' ? undefined : rejected('finished');
  const guard = (): WizardActionResult | undefined => {
    const result = activeStep().canAdvance?.({
      activeIndex: activeIndex(),
      step: activeStep(),
      steps: options.steps,
    });

    if (result === false) {
      return rejected('blocked');
    }

    return typeof result === 'string' && result.length > 0
      ? rejected('blocked', result)
      : undefined;
  };
  const move = (nextId: string): WizardActionResult => {
    const previousId = activeId;

    activeId = nextId;
    options.onStepChange?.(activeId, previousId);

    return succeeded('navigate');
  };

  return {
    activeIndex,
    activeStep,
    cancel() {
      const inactive = ensureActive();

      if (inactive !== undefined) {
        return inactive;
      }

      lifecycle = 'cancelled';
      options.onCancel?.(activeStep());

      return succeeded('cancel');
    },
    complete() {
      const inactive = ensureActive();

      if (inactive !== undefined) {
        return inactive;
      }

      if (activeIndex() !== options.steps.length - 1) {
        return rejected('out-of-range');
      }

      const blocked = guard();

      if (blocked !== undefined) {
        return blocked;
      }

      lifecycle = 'completed';
      options.onComplete?.(activeStep());

      return succeeded('complete');
    },
    goTo(stepId) {
      const inactive = ensureActive();

      if (inactive !== undefined) {
        return inactive;
      }

      const nextIndex = options.steps.findIndex(({ id }) => id === stepId);

      if (nextIndex < 0) {
        return rejected('out-of-range');
      }

      if (nextIndex > activeIndex()) {
        const blocked = guard();

        if (blocked !== undefined) {
          return blocked;
        }
      }

      return stepId === activeId ? succeeded('navigate') : move(stepId);
    },
    hasPrevious: () => activeIndex() > 0,
    isLast: () => activeIndex() === options.steps.length - 1,
    next() {
      const inactive = ensureActive();

      if (inactive !== undefined) {
        return inactive;
      }

      if (activeIndex() === options.steps.length - 1) {
        return this.complete();
      }

      const blocked = guard();

      if (blocked !== undefined) {
        return blocked;
      }

      return move((options.steps[activeIndex() + 1] as WizardStep).id);
    },
    previous() {
      const inactive = ensureActive();

      if (inactive !== undefined) {
        return inactive;
      }

      if (activeIndex() === 0) {
        return rejected('out-of-range');
      }

      return move((options.steps[activeIndex() - 1] as WizardStep).id);
    },
    reset() {
      const previousId = activeId;

      activeId = options.defaultStepId ?? options.steps[0]?.id ?? '';
      lifecycle = 'active';

      if (activeId !== previousId) {
        options.onStepChange?.(activeId, previousId);
      }

      return succeeded('navigate');
    },
    setOptions(nextOptions) {
      assertSteps(nextOptions.steps);
      assertDefaultStep(nextOptions);
      options = nextOptions;

      if (!options.steps.some(({ id }) => id === activeId)) {
        activeId = options.defaultStepId ?? options.steps[0]?.id ?? '';
      }
    },
    status: () => lifecycle,
  };
}

/** Renders Wizard progress, the active page, and navigation affordances. */
export function renderWizard({
  activeIndex = 0,
  height,
  labels: labelOverrides,
  markers = STEP_INDICATOR_UNICODE_MARKERS,
  steps,
  width,
}: RenderWizardOptions): string {
  assertSteps(steps);

  if (!Number.isInteger(activeIndex) || activeIndex < 0 || activeIndex >= steps.length) {
    throw new RangeError('Wizard activeIndex must reference an existing step.');
  }

  const activeStep = steps[activeIndex] as WizardStep;
  const labels = {
    back: 'Back',
    cancel: 'Cancel',
    complete: 'Complete',
    next: 'Next',
    ...labelOverrides,
  };
  const progress = renderStepIndicator({
    markers,
    orientation: 'horizontal',
    steps: steps.map((step, index) => ({
      id: step.id,
      label: step.label,
      state:
        index < activeIndex
          ? ('completed' as const)
          : index === activeIndex
            ? ('active' as const)
            : ('pending' as const),
    })),
    ...(width === undefined ? {} : { width }),
  });
  const body = Array.isArray(activeStep.content)
    ? activeStep.content
    : activeStep.content === undefined
      ? []
      : [activeStep.content];
  const navigation = [
    `[Esc] ${labels.cancel}`,
    activeIndex > 0 ? `← ${labels.back}` : `(${labels.back})`,
    activeIndex === steps.length - 1 ? labels.complete : `${labels.next} →`,
  ].join('  ');
  const lines = [
    progress,
    '',
    activeStep.title ?? activeStep.label,
    ...(activeStep.description === undefined ? [] : [activeStep.description]),
    ...(body.length === 0 ? [] : ['', ...body]),
    '',
    navigation,
  ];

  return renderPlainLines(lines, {
    ...(height === undefined ? {} : { height }),
    ...(width === undefined ? {} : { width }),
  });
}
