import blessed from 'blessed';

import { renderSwitch, type SwitchCharacters } from '@/components/input/switch/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the Switch adapter. */
export type SwitchBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'keys' | 'mouse' | 'parent' | 'tags'
>;

/** Stateful data accepted by the Blessed {@link switchControl} adapter. */
export interface SwitchData {
  /** Controlled checked state. */
  checked?: boolean;

  /** Character tokens used by the pure renderer. */
  characters?: SwitchCharacters;

  /** Initial checked state for uncontrolled usage. */
  defaultChecked?: boolean;

  /** Whether focus and toggling are unavailable. */
  disabled?: boolean;

  /** Non-empty, single-line switch label. */
  label: string;

  /** Text rendered for the off state. */
  offText?: string;

  /** Called after keyboard, mouse, or imperative toggling requests a state change. */
  onCheckedChange?: (checked: boolean) => void;

  /** Text rendered for the on state. */
  onText?: string;
}

/** Options accepted by the Blessed {@link switchControl} adapter. */
export interface SwitchOptions {
  /** Optional dimensions, position, style, and standard Blessed settings. */
  box?: SwitchBoxOptions;

  /** Label, state, callback, and character data. */
  data: SwitchData;

  /** Blessed screen or node receiving the switch. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link switchControl}. */
export interface SwitchHandle
  extends BlessedComponentHandle<SwitchData, blessed.Widgets.BoxElement> {
  /** Returns the current controlled or uncontrolled checked state. */
  checked(): boolean;

  /** Gives terminal focus to an enabled switch. */
  focus(): void;

  /** Sets an enabled switch state and reports whether setting occurred. */
  setChecked(checked: boolean): boolean;

  /** Toggles an enabled switch and reports whether toggling occurred. */
  toggle(): boolean;
}

interface Keypress {
  full?: string;
  name?: string;
}

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates a keyboard and mouse accessible Switch backed by a Blessed box. */
export function switchControl({ box, data: initialData, parent }: SwitchOptions): SwitchHandle {
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
  const currentChecked = (): boolean =>
    isControlled() ? (data.checked ?? false) : uncontrolledChecked;
  const render = (): void => {
    element.setContent(
      renderSwitch({
        checked: currentChecked(),
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        disabled: data.disabled === true,
        focused,
        label: data.label,
        ...(data.offText === undefined ? {} : { offText: data.offText }),
        ...(data.onText === undefined ? {} : { onText: data.onText }),
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
  const commitChecked = (checked: boolean): boolean => {
    if (data.disabled === true) {
      return false;
    }

    if (!isControlled()) {
      uncontrolledChecked = checked;
    }

    data.onCheckedChange?.(checked);
    render();

    return true;
  };
  const handle: SwitchHandle = {
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
    setChecked: commitChecked,
    setData(nextData) {
      data = nextData;

      if (!isControlled() && nextData.defaultChecked !== undefined) {
        uncontrolledChecked = nextData.defaultChecked;
      }

      syncInteraction();
      render();
    },
    toggle() {
      return commitChecked(!currentChecked());
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
