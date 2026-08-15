import blessed from 'blessed';
import {
  renderStepIndicator,
  STEP_INDICATOR_ASCII_MARKERS,
  STEP_INDICATOR_UNICODE_MARKERS,
} from '@/components/feedback/step-indicator/index.js';
import {
  type CreateStepperFormStateOptions,
  createStepperFormState,
  type StepperFormNavigationResult,
  type StepperFormStateModel,
} from '@/components/navigation/stepper-form/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import { type BoxData, createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

export type StepperFormBoxOptions = Omit<blessed.Widgets.FormOptions, 'content' | 'parent'>;

/** Stateful data accepted by the Blessed {@link stepperForm} adapter. */
export interface StepperFormData extends CreateStepperFormStateOptions, BoxData {
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;
  /** Labels shown in the navigation footer. */
  labels?: { back?: string; complete?: string; next?: string };
}

export interface StepperFormOptions {
  box?: StepperFormBoxOptions;
  data: StepperFormData;
  parent: blessed.Widgets.Node;
}

export interface StepperFormHandle
  extends BlessedComponentHandle<StepperFormData, blessed.Widgets.FormElement<unknown>>,
    Pick<
      StepperFormStateModel,
      | 'activeIndex'
      | 'activeStep'
      | 'complete'
      | 'goTo'
      | 'hasPrevious'
      | 'isLast'
      | 'next'
      | 'previous'
      | 'validate'
    > {
  focus(): void;
}

function innerWidth(element: blessed.Widgets.FormElement<unknown>): number | undefined {
  const width = typeof element.width === 'number' ? element.width : undefined;
  const inset = typeof element.iwidth === 'number' ? element.iwidth : 0;

  return width === undefined ? undefined : Math.max(1, Math.floor(width - inset));
}

/** Creates an interactive multi-step form container backed by the shared state model. */
export function stepperForm({
  box,
  data: initialData,
  parent,
}: StepperFormOptions): StepperFormHandle {
  let data = initialData;

  const element = blessed.form<unknown>({
    keys: true,
    mouse: true,
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const style = createBoxStyleController(element, box, {}, { component: 'stepper-form' });
  const options = (): CreateStepperFormStateOptions => ({
    ...(data.defaultStepId === undefined ? {} : { defaultStepId: data.defaultStepId }),
    getValues: data.getValues,
    ...(data.onComplete === undefined ? {} : { onComplete: data.onComplete }),
    ...(data.onInvalid === undefined ? {} : { onInvalid: data.onInvalid }),
    onStepChange: (stepId, previousStepId) => {
      data.onStepChange?.(stepId, previousStepId);
      render();
    },
    steps: data.steps,
    ...(data.validate === undefined ? {} : { validate: data.validate }),
  });
  const state = createStepperFormState(options());
  const render = (): void => {
    const capabilities = data.capabilities ?? detectCapabilities();
    const active = state.activeIndex();
    const labels = { back: 'Back', complete: 'Complete', next: 'Next', ...data.labels };
    const width = innerWidth(element);
    const steps = data.steps.map((step, index) => ({
      id: step.id,
      label: step.label,
      state:
        index < active
          ? ('completed' as const)
          : index === active
            ? ('active' as const)
            : ('pending' as const),
    }));
    const navigation = `${state.hasPrevious() ? `← ${labels.back}` : `(${labels.back})`}  ${state.isLast() ? labels.complete : `${labels.next} →`}`;

    element.setContent(
      `${renderStepIndicator({
        markers: capabilities.unicode
          ? STEP_INDICATOR_UNICODE_MARKERS
          : STEP_INDICATOR_ASCII_MARKERS,
        orientation: 'horizontal',
        steps,
        ...(width === undefined ? {} : { width }),
      })}\n${navigation}`,
    );
    style.apply({
      backgroundTone: data.backgroundTone,
      borderTone: data.borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: data.foregroundTone,
      theme: data.theme,
    });
  };
  const navigate = (action: () => StepperFormNavigationResult): StepperFormNavigationResult => {
    const result = action();

    render();

    return result;
  };

  render();

  const handle: StepperFormHandle = {
    activeIndex: state.activeIndex,
    activeStep: state.activeStep,
    complete: () => navigate(() => state.complete()),
    destroy: () => element.destroy(),
    element,
    focus: () => element.focus(),
    goTo: (id) => navigate(() => state.goTo(id)),
    hasPrevious: state.hasPrevious,
    isLast: state.isLast,
    next: () => navigate(() => state.next()),
    previous: () => navigate(() => state.previous()),
    setData(nextData) {
      data = nextData;
      state.setOptions(options());
      render();
    },
    validate: state.validate,
  };

  element.on('keypress', (_character: string, key: { full?: string; name?: string }) => {
    switch (key.full ?? key.name) {
      case 'left':
      case 'shift-tab':
        handle.previous();
        break;
      case 'right':
      case 'tab':
      case 'enter':
        handle.next();
        break;
    }
  });
  element.on('resize', render);

  return handle;
}
