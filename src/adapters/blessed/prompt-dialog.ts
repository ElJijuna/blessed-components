import type blessed from 'blessed';

import type { CreateDialogStateOptions } from '@/components/overlays/dialog/index.js';
import type { Theme, ThemeColors } from '@/core/theme.js';
import { type ButtonBoxOptions, button } from './button.js';
import {
  type DialogBoxOptions,
  type DialogRootHandle,
  dialogContent,
  dialogDescription,
  dialogRoot,
  dialogTitle,
} from './dialog.js';
import { getScreenOverlayStack } from './overlay-stack.js';
import { type TextFieldBoxOptions, type TextFieldData, textField } from './text-field.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by PromptDialog containers. */
export type PromptDialogBoxOptions = DialogBoxOptions;

/** Stateful data accepted by the Blessed {@link promptDialog} adapter. */
export interface PromptDialogData extends CreateDialogStateOptions {
  /** Semantic background token. */
  backgroundTone?: keyof ThemeColors;

  /** Cancel action label. @defaultValue `'Cancel'` */
  cancelLabel?: string;

  /** Whether submit or cancel requests closing. @defaultValue `true` */
  closeOnAction?: boolean;

  /** Initial input value for uncontrolled usage. */
  defaultValue?: string;

  /** Supporting text shown below the title. */
  description?: string;

  /** Validation error shown below the input. */
  error?: string;

  /** Helpful text shown below the input when no error is present. */
  hint?: string;

  /** Stable overlay identifier. */
  id: string;

  /** Preferred registered focus target when opening. @defaultValue `'input'` */
  initialFocusId?: 'cancel' | 'input' | 'submit';

  /** Whether text editing is unavailable. */
  inputDisabled?: boolean;

  /** Persistent label for the text input. */
  message: string;

  /** Whether this PromptDialog blocks lower overlay layers. @defaultValue `true` */
  modal?: boolean;

  /** Called when cancellation is requested. */
  onCancel?: () => void;

  /** Called after user or imperative edits request a value change. */
  onValueChange?: (value: string) => void;

  /** Called when submission is requested with the current value. */
  onSubmit?: (value: string) => void;

  /** Placeholder shown while the input is empty. */
  placeholder?: string;

  /** Whether the input label includes a required indicator. */
  required?: boolean;

  /** Whether submission is unavailable. */
  submitDisabled?: boolean;

  /** Submit action label. @defaultValue `'OK'` */
  submitLabel?: string;

  /** Semantic terminal theme. */
  theme?: Theme;

  /** Dialog title. */
  title: string;

  /** Controlled input value. */
  value?: string;
}

/** Options accepted by the Blessed {@link promptDialog} adapter. */
export interface PromptDialogOptions {
  /** Optional full-screen layer position, style, and standard Blessed settings. */
  box?: PromptDialogBoxOptions;

  /** Action button layout overrides. */
  buttons?: {
    /** Cancel button options. */
    cancel?: ButtonBoxOptions;

    /** Submit button options. */
    submit?: ButtonBoxOptions;
  };

  /** Centered dialog panel layout overrides. */
  content?: PromptDialogBoxOptions;

  /** Input layout overrides. */
  input?: TextFieldBoxOptions;

  /** Visibility, content, input state, actions, and theme configuration. */
  data: PromptDialogData;

  /** Blessed screen or node receiving the Dialog layer. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link promptDialog}. */
export interface PromptDialogHandle
  extends BlessedComponentHandle<PromptDialogData, blessed.Widgets.BoxElement> {
  /** Current controlled or uncontrolled open state. */
  readonly isOpen: boolean;

  /** Requests cancellation and reports whether the action occurred. */
  cancel(): boolean;

  /** Clears an editable value and reports whether it changed. */
  clear(): boolean;

  /** Requests closing without choosing an action. */
  close(): boolean;

  /** Gives focus to the input while open. */
  focus(): void;

  /** Requests opening. */
  open(): boolean;

  /** Sets an editable controlled or uncontrolled value. */
  setValue(value: string): boolean;

  /** Submits the current value and reports whether the action occurred. */
  submit(): boolean;

  /** Requests opposite open state. */
  toggle(): boolean;

  /** Returns the current controlled or uncontrolled input value. */
  value(): string;
}

interface Keypress {
  full?: string;
  name?: string;
}

function rootData(data: PromptDialogData): Parameters<DialogRootHandle['setData']>[0] {
  const preferredFocus = data.initialFocusId ?? 'input';
  const initialFocusId =
    (preferredFocus === 'input' && data.inputDisabled === true) ||
    (preferredFocus === 'submit' && data.submitDisabled === true)
      ? 'cancel'
      : preferredFocus;

  return {
    ...(data.backgroundTone === undefined ? {} : { backgroundTone: data.backgroundTone }),
    ...(data.defaultOpen === undefined ? {} : { defaultOpen: data.defaultOpen }),
    dismissOnEscape: false,
    id: data.id,
    initialFocusId,
    ...(data.modal === undefined ? {} : { modal: data.modal }),
    ...(data.onOpenChange === undefined ? {} : { onOpenChange: data.onOpenChange }),
    ...(data.open === undefined ? {} : { open: data.open }),
    ...(data.theme === undefined ? {} : { theme: data.theme }),
  };
}

/**
 * Creates an input Dialog with controlled/uncontrolled value and visibility.
 *
 * Tab is trapped across input, submit, and cancel; Enter submits from the
 * input; Escape cancels only the topmost PromptDialog; closing restores the
 * previously focused element.
 */
export function promptDialog({
  box,
  buttons,
  content,
  input: inputBox,
  data: initialData,
  parent,
}: PromptDialogOptions): PromptDialogHandle {
  let data = initialData;
  let uncontrolledValue = initialData.defaultValue ?? '';

  const isValueControlled = (): boolean => Object.hasOwn(data, 'value');
  const currentValue = (): string => (isValueControlled() ? (data.value ?? '') : uncontrolledValue);
  const root = dialogRoot({
    ...(box === undefined ? {} : { box }),
    data: rootData(data),
    parent,
  });
  const panel = dialogContent({
    box: {
      height: 10,
      width: 52,
      ...content,
    },
    data: {
      backgroundTone: data.backgroundTone,
      theme: data.theme,
    },
    parent: root.element,
  });
  const title = dialogTitle({
    data: { content: data.title, theme: data.theme },
    parent: panel.element,
  });
  const description = dialogDescription({
    data: { content: data.description ?? '', theme: data.theme },
    parent: panel.element,
  });
  const fieldData = (): TextFieldData => ({
    disabled: data.inputDisabled === true,
    ...(data.error === undefined ? {} : { error: data.error }),
    ...(data.hint === undefined ? {} : { hint: data.hint }),
    label: data.message,
    onSubmit: () => handle.submit(),
    onValueChange: (value) => commitValue(value),
    ...(data.placeholder === undefined ? {} : { placeholder: data.placeholder }),
    ...(data.required === undefined ? {} : { required: data.required }),
    value: currentValue(),
  });
  const input = textField({
    box: {
      bottom: 2,
      height: 5,
      left: 0,
      right: 0,
      top: 2,
      ...inputBox,
      inputOnFocus: false,
    },
    data: fieldData(),
    parent: panel.element,
  });
  const cancel = button({
    box: {
      bottom: 0,
      height: 1,
      left: 0,
      width: Math.max(12, (data.cancelLabel ?? 'Cancel').length + 6),
      ...buttons?.cancel,
    },
    data: {
      label: data.cancelLabel ?? 'Cancel',
      onPress: () => handle.cancel(),
      ...(data.theme === undefined ? {} : { theme: data.theme }),
    },
    parent: panel.element,
  });
  const submit = button({
    box: {
      bottom: 0,
      height: 1,
      right: 0,
      width: Math.max(12, (data.submitLabel ?? 'OK').length + 6),
      ...buttons?.submit,
    },
    data: {
      disabled: data.submitDisabled === true,
      label: data.submitLabel ?? 'OK',
      onPress: () => handle.submit(),
      ...(data.theme === undefined ? {} : { theme: data.theme }),
    },
    parent: panel.element,
  });
  const overlays = getScreenOverlayStack(root.element.screen);

  let inputRegistered = false;
  let submitRegistered = false;

  input.element.on('focus', () => {
    if (data.inputDisabled !== true) {
      input.element.readInput();
    }
  });

  const syncFocusables = (): void => {
    if (data.inputDisabled === true && inputRegistered) {
      root.unregisterFocusable('input');
      inputRegistered = false;
    } else if (data.inputDisabled !== true && !inputRegistered) {
      root.registerFocusable('input', input.element);
      inputRegistered = true;
    }

    if (data.submitDisabled === true && submitRegistered) {
      root.unregisterFocusable('submit');
      submitRegistered = false;
    } else if (data.submitDisabled !== true && !submitRegistered) {
      root.registerFocusable('submit', submit.element);
      submitRegistered = true;
    }
  };
  const syncInput = (): void => {
    input.setData(fieldData());
  };
  const commitValue = (value: string): boolean => {
    if (data.inputDisabled === true) {
      return false;
    }

    if (!isValueControlled()) {
      uncontrolledValue = value;
    }

    data.onValueChange?.(value);
    syncInput();

    return true;
  };
  const setChildData = (): void => {
    const cancelLabel = data.cancelLabel ?? 'Cancel';
    const submitLabel = data.submitLabel ?? 'OK';

    root.setData(rootData(data));
    panel.setData({
      backgroundTone: data.backgroundTone,
      theme: data.theme,
    });
    title.setData({ content: data.title, theme: data.theme });
    description.setData({ content: data.description ?? '', theme: data.theme });
    syncInput();
    cancel.element.width = Math.max(12, cancelLabel.length + 6);
    cancel.setData({
      label: cancelLabel,
      onPress: () => handle.cancel(),
      ...(data.theme === undefined ? {} : { theme: data.theme }),
    });
    submit.element.width = Math.max(12, submitLabel.length + 6);
    submit.setData({
      disabled: data.submitDisabled === true,
      label: submitLabel,
      onPress: () => handle.submit(),
      ...(data.theme === undefined ? {} : { theme: data.theme }),
    });
    syncFocusables();
  };
  const onKeypress = (_character: string, key: Keypress): void => {
    if (root.isOpen && overlays.top()?.id === data.id && (key.full ?? key.name) === 'escape') {
      handle.cancel();
    }
  };
  const handle: PromptDialogHandle = {
    cancel() {
      if (!root.isOpen) {
        return false;
      }

      data.onCancel?.();

      if (data.closeOnAction ?? true) {
        root.close();
      }

      return true;
    },
    clear() {
      return commitValue('');
    },
    close() {
      return root.close();
    },
    destroy() {
      root.element.screen.removeListener('keypress', onKeypress);
      input.element.cancel();
      root.destroy();
    },
    element: root.element,
    focus() {
      if (root.isOpen) {
        input.focus();
      }
    },
    get isOpen() {
      return root.isOpen;
    },
    open() {
      return root.open();
    },
    setData(nextData) {
      const previousValue = currentValue();
      const wasControlled = isValueControlled();

      data = nextData;

      if (!isValueControlled() && wasControlled) {
        uncontrolledValue = previousValue;
      }

      setChildData();
    },
    setValue(value) {
      return commitValue(value);
    },
    submit() {
      if (!root.isOpen || data.submitDisabled === true) {
        return false;
      }

      data.onSubmit?.(currentValue());

      if (data.closeOnAction ?? true) {
        root.close();
      }

      return true;
    },
    toggle() {
      return root.toggle();
    },
    value: currentValue,
  };

  syncFocusables();
  root.registerFocusable('cancel', cancel.element);
  root.element.screen.on('keypress', onKeypress);

  return handle;
}
