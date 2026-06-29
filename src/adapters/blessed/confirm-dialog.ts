import type blessed from 'blessed';

import {
  type ConfirmDialogResult,
  type ConfirmDialogStateOptions,
  normalizeConfirmDialogAction,
} from '@/components/overlays/confirm-dialog/index.js';
import type { Theme, ThemeColors } from '@/core/theme.js';
import { button } from './button.js';
import {
  type DialogBoxOptions,
  type DialogRootHandle,
  dialogBody,
  dialogContent,
  dialogDescription,
  dialogRoot,
  dialogTitle,
} from './dialog.js';
import { getScreenOverlayStack } from './overlay-stack.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by ConfirmDialog parts. */
export type ConfirmDialogBoxOptions = DialogBoxOptions;

/** Stateful data accepted by {@link confirmDialog}. */
export interface ConfirmDialogData extends ConfirmDialogStateOptions {
  /** Semantic background token. */
  backgroundTone?: keyof ThemeColors;

  /** Cancel action label. @defaultValue `'Cancel'` */
  cancelLabel?: string;

  /** Confirm action label. @defaultValue `'Confirm'` */
  confirmLabel?: string;

  /** Whether choosing an action requests closing. @defaultValue `true` */
  closeOnAction?: boolean;

  /** Supporting text shown below the title. */
  description?: string;

  /** Stable overlay identifier. */
  id: string;

  /** Preferred registered focus identifier. @defaultValue `'cancel'` */
  initialFocusId?: 'cancel' | 'confirm';

  /** Main decision message. */
  message?: string;

  /** Whether this ConfirmDialog blocks lower overlay layers. @defaultValue `true` */
  modal?: boolean;

  /** Semantic terminal theme. */
  theme?: Theme;

  /** Dialog title. */
  title: string;
}

/** Options accepted by {@link confirmDialog}. */
export interface ConfirmDialogOptions {
  /** Optional dimensions, position, style, and standard Blessed settings. */
  box?: ConfirmDialogBoxOptions;

  /** Button-specific layout overrides. */
  buttons?: {
    /** Cancel button options. */
    cancel?: ConfirmDialogBoxOptions;

    /** Confirm button options. */
    confirm?: ConfirmDialogBoxOptions;
  };

  /** Dialog content layout overrides. */
  content?: ConfirmDialogBoxOptions;

  /** Text, state, actions, and semantic theme configuration. */
  data: ConfirmDialogData;

  /** Blessed screen or node receiving the Dialog layer. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link confirmDialog}. */
export interface ConfirmDialogHandle
  extends BlessedComponentHandle<ConfirmDialogData, blessed.Widgets.BoxElement> {
  /** Current controlled or uncontrolled open state. */
  readonly isOpen: boolean;

  /** Requests cancel. */
  cancel(): boolean;

  /** Requests closing without choosing an action. */
  close(): boolean;

  /** Requests confirm. */
  confirm(): boolean;

  /** Requests opening. */
  open(): boolean;

  /** Requests opposite open state. */
  toggle(): boolean;
}

interface Keypress {
  full?: string;
  name?: string;
}

function actionLabels(data: ConfirmDialogData): {
  cancel: string;
  confirm: string;
} {
  return {
    cancel: normalizeConfirmDialogAction({
      label: data.cancelLabel ?? 'Cancel',
      result: 'cancel',
    }).label,
    confirm: normalizeConfirmDialogAction({
      label: data.confirmLabel ?? 'Confirm',
      result: 'confirm',
    }).label,
  };
}

function rootData(data: ConfirmDialogData): Parameters<DialogRootHandle['setData']>[0] {
  return {
    ...(data.backgroundTone === undefined ? {} : { backgroundTone: data.backgroundTone }),
    ...(data.defaultOpen === undefined ? {} : { defaultOpen: data.defaultOpen }),
    dismissOnEscape: false,
    id: data.id,
    initialFocusId: data.initialFocusId ?? 'cancel',
    ...(data.modal === undefined ? {} : { modal: data.modal }),
    ...(data.onOpenChange === undefined ? {} : { onOpenChange: data.onOpenChange }),
    ...(data.open === undefined ? {} : { open: data.open }),
    ...(data.theme === undefined ? {} : { theme: data.theme }),
  };
}

/**
 * Creates an opinionated two-action Dialog for consequential decisions.
 *
 * Escape is treated as cancel, cancel receives initial focus by default, and
 * action callbacks are invoked before requesting close.
 */
export function confirmDialog({
  box,
  buttons,
  content,
  data: initialData,
  parent,
}: ConfirmDialogOptions): ConfirmDialogHandle {
  let data = initialData;

  const root = dialogRoot({
    ...(box === undefined ? {} : { box }),
    data: rootData(data),
    parent,
  });
  const panel = dialogContent({
    box: {
      height: 9,
      width: 50,
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
  const body = dialogBody({
    box: { bottom: 2 },
    data: { content: data.message ?? '', theme: data.theme },
    parent: panel.element,
  });
  const labels = actionLabels(data);
  const cancel = button({
    box: {
      bottom: 0,
      height: 1,
      left: 0,
      width: Math.max(12, labels.cancel.length + 6),
      ...buttons?.cancel,
    },
    data: {
      label: labels.cancel,
      onPress: () => handle.cancel(),
      ...(data.theme === undefined ? {} : { theme: data.theme }),
    },
    parent: panel.element,
  });
  const confirm = button({
    box: {
      bottom: 0,
      height: 1,
      right: 0,
      width: Math.max(12, labels.confirm.length + 6),
      ...buttons?.confirm,
    },
    data: {
      label: labels.confirm,
      onPress: () => handle.confirm(),
      ...(data.theme === undefined ? {} : { theme: data.theme }),
    },
    parent: panel.element,
  });
  const overlays = getScreenOverlayStack(root.element.screen);
  const choose = (result: ConfirmDialogResult): boolean => {
    if (result === 'confirm') {
      data.onConfirm?.();
    } else {
      data.onCancel?.();
    }

    data.onResult?.(result);

    if (data.closeOnAction ?? true) {
      root.close();
    }

    return root.isOpen;
  };
  const setChildData = (): void => {
    const nextLabels = actionLabels(data);

    root.setData(rootData(data));
    panel.setData({
      backgroundTone: data.backgroundTone,
      theme: data.theme,
    });
    title.setData({ content: data.title, theme: data.theme });
    description.setData({ content: data.description ?? '', theme: data.theme });
    body.setData({ content: data.message ?? '', theme: data.theme });
    cancel.element.width = Math.max(12, nextLabels.cancel.length + 6);
    cancel.setData({
      label: nextLabels.cancel,
      onPress: () => handle.cancel(),
      ...(data.theme === undefined ? {} : { theme: data.theme }),
    });
    confirm.element.width = Math.max(12, nextLabels.confirm.length + 6);
    confirm.setData({
      label: nextLabels.confirm,
      onPress: () => handle.confirm(),
      ...(data.theme === undefined ? {} : { theme: data.theme }),
    });
  };
  const onKeypress = (_character: string, key: Keypress): void => {
    if (!root.isOpen || overlays.top()?.id !== data.id) {
      return;
    }

    if ((key.full ?? key.name) === 'escape') {
      handle.cancel();
    }
  };
  const handle: ConfirmDialogHandle = {
    cancel() {
      return choose('cancel');
    },
    close() {
      return root.close();
    },
    confirm() {
      return choose('confirm');
    },
    destroy() {
      root.element.screen.removeListener('keypress', onKeypress);
      root.destroy();
    },
    element: root.element,
    get isOpen() {
      return root.isOpen;
    },
    open() {
      return root.open();
    },
    setData(nextData) {
      data = nextData;
      setChildData();
    },
    toggle() {
      return root.toggle();
    },
  };

  root.registerFocusable('cancel', cancel.element);
  root.registerFocusable('confirm', confirm.element);
  root.element.screen.on('keypress', onKeypress);

  return handle;
}
