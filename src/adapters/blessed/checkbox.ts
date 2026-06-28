import blessed from 'blessed';

import {
  type CheckboxCharacters,
  type CheckboxState,
  renderCheckbox,
} from '@/components/input/checkbox/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Checkbox adapter. */
export type CheckboxBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'keys' | 'mouse' | 'parent' | 'tags'
>;

/** Stateful data accepted by the Blessed {@link checkbox} adapter. */
export interface CheckboxData {
  /** Controlled checked state. */
  checked?: CheckboxState;

  /** Character tokens used by the pure renderer. */
  characters?: CheckboxCharacters;

  /** Initial checked state for uncontrolled usage. */
  defaultChecked?: CheckboxState;

  /** Whether focus and toggling are unavailable. */
  disabled?: boolean;

  /** Non-empty, single-line checkbox label. */
  label: string;

  /** Called after keyboard, mouse, or imperative toggling requests a state change. */
  onCheckedChange?: (checked: boolean) => void;
}

/** Options accepted by the Blessed {@link checkbox} adapter. */
export interface CheckboxOptions {
  /** Optional dimensions, position, style, and standard Blessed settings. */
  box?: CheckboxBoxOptions;

  /** Label, state, callback, and character data. */
  data: CheckboxData;

  /** Blessed screen or node receiving the checkbox. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link checkbox}. */
export interface CheckboxHandle
  extends BlessedComponentHandle<CheckboxData, blessed.Widgets.BoxElement> {
  /** Returns the current controlled or uncontrolled checked state. */
  checked(): CheckboxState;

  /** Gives terminal focus to an enabled checkbox. */
  focus(): void;

  /** Toggles an enabled checkbox and reports whether toggling occurred. */
  toggle(): boolean;
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates a keyboard and mouse accessible Checkbox backed by a Blessed box. */
export function checkbox({ box, data: initialData, parent }: CheckboxOptions): CheckboxHandle {
  let data = initialData;
  let focused = false;
  let uncontrolledChecked = initialData.defaultChecked ?? false;

  const element = blessed.box({
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const width = (): number =>
    Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth));
  const isControlled = (): boolean => Object.hasOwn(data, 'checked');
  const currentChecked = (): CheckboxState =>
    isControlled() ? (data.checked ?? false) : uncontrolledChecked;
  const render = (): void => {
    element.setContent(
      renderCheckbox({
        checked: currentChecked(),
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        disabled: data.disabled === true,
        focused,
        label: data.label,
        width: width(),
      }),
    );
  };
  const removeFrom = (elements: blessed.Widgets.BlessedElement[]): void => {
    const index = elements.indexOf(element);

    if (index >= 0) {
      elements.splice(index, 1);
    }
  };
  const syncInteraction = (): void => {
    if (data.disabled === true) {
      removeFrom(element.screen.clickable);
      removeFrom(element.screen.keyable);

      return;
    }

    element.enableInput();
  };
  const handle: CheckboxHandle = {
    checked: currentChecked,
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

      if (!isControlled() && nextData.defaultChecked !== undefined) {
        uncontrolledChecked = nextData.defaultChecked;
      }

      syncInteraction();
      render();
    },
    toggle() {
      if (data.disabled === true) {
        return false;
      }

      const nextChecked = currentChecked() !== true;

      if (!isControlled()) {
        uncontrolledChecked = nextChecked;
      }

      data.onCheckedChange?.(nextChecked);
      render();

      return true;
    },
  };

  element.on('blur', () => {
    focused = false;
    render();
  });
  element.on('click', () => {
    handle.toggle();
  });
  element.on('focus', () => {
    focused = true;
    render();
  });
  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'enter':
      case 'space':
        handle.toggle();
        break;
    }
  });
  element.on('resize', render);

  syncInteraction();
  render();

  return handle;
}
