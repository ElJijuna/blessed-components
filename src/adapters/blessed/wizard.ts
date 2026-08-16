import blessed from 'blessed';
import {
  STEP_INDICATOR_ASCII_MARKERS,
  STEP_INDICATOR_UNICODE_MARKERS,
} from '@/components/feedback/step-indicator/index.js';
import {
  type CreateWizardStateOptions,
  createWizardState,
  renderWizard,
  type WizardActionResult,
  type WizardLabels,
  type WizardStateModel,
} from '@/components/navigation/wizard/index.js';
import { detectCapabilities, type TerminalCapabilities } from '@/core/capabilities.js';
import { type BoxData, type BoxElementOptions, createBoxStyleController } from './box.js';
import { type DialogRootData, type DialogRootHandle, dialogRoot } from './dialog.js';
import type { BlessedComponentHandle } from './types.js';

/** Visual container used by the Blessed Wizard adapter. */
export type WizardMode = 'modal' | 'page';

/** Blessed options supported by Wizard. */
export type WizardBoxOptions = BoxElementOptions;

/** Stateful data accepted by the Blessed {@link wizard} adapter. */
export interface WizardData extends CreateWizardStateOptions, BoxData {
  /** Terminal capabilities used for progress markers and theme colors. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel' | 'unicode'>;
  /** Whether Escape dismisses a modal Wizard. @defaultValue `true` */
  dismissOnEscape?: boolean;
  /** Stable identity used by modal overlay stacking. */
  id: string;
  /** Labels shown in the navigation footer. */
  labels?: WizardLabels;
}

/** Options accepted by the Blessed {@link wizard} adapter. */
export interface WizardOptions {
  /** Position, dimensions, border, padding, and standard Blessed settings. */
  box?: WizardBoxOptions;
  /** Guided-flow steps, callbacks, labels, and theme data. */
  data: WizardData;
  /** Modal overlay or in-layout page behavior. @defaultValue `'page'` */
  mode?: WizardMode;
  /** Blessed screen or node receiving the Wizard. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link wizard}. */
export interface WizardHandle
  extends BlessedComponentHandle<WizardData, blessed.Widgets.BoxElement>,
    Pick<
      WizardStateModel,
      | 'activeIndex'
      | 'activeStep'
      | 'cancel'
      | 'complete'
      | 'goTo'
      | 'hasPrevious'
      | 'isLast'
      | 'next'
      | 'previous'
      | 'reset'
      | 'status'
    > {
  /** Focuses the Wizard container. */
  focus(): void;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : undefined;
}

function innerDimension(
  outer: blessed.Widgets.Types.TPosition,
  inset: blessed.Widgets.Types.TPosition,
): number | undefined {
  const outerSize = numericDimension(outer);

  return outerSize === undefined
    ? undefined
    : Math.max(0, outerSize - (numericDimension(inset) ?? 0));
}

/** Creates a page-level or modal guided flow backed by the shared Wizard state. */
export function wizard({
  box,
  data: initialData,
  mode = 'page',
  parent,
}: WizardOptions): WizardHandle {
  let data = initialData;
  let internalModalClose = false;
  let render = (): void => undefined;

  const options = (): CreateWizardStateOptions => ({
    ...(data.defaultStepId === undefined ? {} : { defaultStepId: data.defaultStepId }),
    ...(data.onCancel === undefined ? {} : { onCancel: data.onCancel }),
    ...(data.onComplete === undefined ? {} : { onComplete: data.onComplete }),
    onStepChange: (stepId, previousStepId) => {
      data.onStepChange?.(stepId, previousStepId);
      render();
    },
    steps: data.steps,
  });
  const state = createWizardState(options());
  const onModalOpenChange = (open: boolean): void => {
    if (!open && !internalModalClose && state.status() === 'active') {
      state.cancel();
      render();
    }
  };
  const modalData = (): DialogRootData => ({
    ...(data.backgroundTone === undefined ? {} : { backgroundTone: data.backgroundTone }),
    ...(data.borderTone === undefined ? {} : { borderTone: data.borderTone }),
    ...(data.capabilities === undefined ? {} : { capabilities: data.capabilities }),
    defaultOpen: true,
    dismissOnEscape: data.dismissOnEscape ?? true,
    ...(data.foregroundTone === undefined ? {} : { foregroundTone: data.foregroundTone }),
    id: data.id,
    modal: true,
    onOpenChange: onModalOpenChange,
    ...(data.theme === undefined ? {} : { theme: data.theme }),
  });
  const modal: DialogRootHandle | undefined =
    mode === 'modal'
      ? dialogRoot({
          ...(box === undefined ? {} : { box }),
          data: modalData(),
          parent,
        })
      : undefined;
  const element =
    modal?.element ??
    blessed.box({
      keyable: true,
      keys: true,
      mouse: true,
      ...box,
      content: '',
      parent,
      style: {
        ...box?.style,
        border: { ...box?.style?.border },
      },
      tags: false,
    });
  const pageStyle =
    mode === 'page'
      ? createBoxStyleController(element, box, {}, { component: 'wizard' })
      : undefined;

  render = (): void => {
    const capabilities = data.capabilities ?? detectCapabilities();
    const width = innerDimension(element.width, element.iwidth);
    const height = innerDimension(element.height, element.iheight);

    pageStyle?.apply({
      backgroundTone: data.backgroundTone,
      borderTone: data.borderTone,
      capabilities: { colorLevel: capabilities.colorLevel },
      foregroundTone: data.foregroundTone,
      theme: data.theme,
    });
    element.setContent(
      renderWizard({
        activeIndex: state.activeIndex(),
        ...(height === undefined ? {} : { height }),
        ...(data.labels === undefined ? {} : { labels: data.labels }),
        markers: capabilities.unicode
          ? STEP_INDICATOR_UNICODE_MARKERS
          : STEP_INDICATOR_ASCII_MARKERS,
        steps: data.steps,
        ...(width === undefined ? {} : { width }),
      }),
    );
  };

  const perform = (action: () => WizardActionResult): WizardActionResult => {
    const result = action();

    render();

    if (
      modal !== undefined &&
      result.ok &&
      (result.action === 'cancel' || result.action === 'complete')
    ) {
      internalModalClose = true;
      modal.close();
      internalModalClose = false;
    }

    return result;
  };

  render();

  const handle: WizardHandle = {
    activeIndex: state.activeIndex,
    activeStep: state.activeStep,
    cancel: () => perform(() => state.cancel()),
    complete: () => perform(() => state.complete()),
    destroy() {
      element.removeListener('keypress', onKeypress);

      if (modal === undefined) {
        element.destroy();
      } else {
        modal.destroy();
      }
    },
    element,
    focus: () => element.focus(),
    goTo: (stepId) => perform(() => state.goTo(stepId)),
    hasPrevious: state.hasPrevious,
    isLast: state.isLast,
    next: () => perform(() => state.next()),
    previous: () => perform(() => state.previous()),
    reset() {
      const result = perform(() => state.reset());

      modal?.open();

      return result;
    },
    setData(nextData) {
      data = nextData;
      state.setOptions(options());

      if (modal !== undefined) {
        modal.setData(modalData());
      }

      render();
    },
    status: state.status,
  };
  const onKeypress = (_character: string, key: { full?: string; name?: string }): void => {
    switch (key.full ?? key.name) {
      case 'escape':
        if (mode === 'page') {
          handle.cancel();
        }

        break;
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
  };

  element.on('keypress', onKeypress);
  element.on('resize', render);

  return handle;
}
