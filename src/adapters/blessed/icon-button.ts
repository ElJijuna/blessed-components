import blessed from 'blessed';

import { type IconButtonVariant, renderIconButton } from '@/components/input/icon-button/index.js';
import type { TerminalCapabilities } from '@/core/capabilities.js';
import type { Theme, ThemeColors } from '@/core/theme.js';
import { createBoxStyleController } from './box.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed options supported by the IconButton adapter. */
export type IconButtonBoxOptions = Omit<
  blessed.Widgets.BoxOptions,
  'content' | 'keys' | 'mouse' | 'parent' | 'tags'
>;

/** Stateful data accepted by the Blessed {@link iconButton} adapter. */
export interface IconButtonData {
  /** Explicit color capability used for deterministic rendering. */
  capabilities?: Pick<TerminalCapabilities, 'colorLevel'>;

  /** Whether focus and activation are unavailable. */
  disabled?: boolean;

  /** Semantic background while disabled. @defaultValue `'background'` */
  disabledBackgroundTone?: keyof ThemeColors;

  /** Semantic foreground while disabled. @defaultValue `'muted'` */
  disabledTone?: keyof ThemeColors;

  /** Semantic background while focused. @defaultValue `'primary'` */
  focusedBackgroundTone?: keyof ThemeColors;

  /** Semantic foreground while focused. @defaultValue `'foreground'` */
  focusedTone?: keyof ThemeColors;

  /** Non-empty, single-line visible icon or glyph. */
  icon: string;

  /** Non-empty, single-line action description. */
  label: string;

  /** Called after keyboard, mouse, or imperative activation. */
  onPress?: () => void;

  /** Semantic background while idle. @defaultValue `'background'` */
  backgroundTone?: keyof ThemeColors;

  /** Whether to render the text label beside the icon. */
  showLabel?: boolean;

  /** Semantic foreground while idle. @defaultValue `'foreground'` */
  tone?: keyof ThemeColors;

  /** Semantic terminal theme. */
  theme?: Theme;

  /** Visual structure. @defaultValue `'bracketed'` */
  variant?: IconButtonVariant;
}

/** Options accepted by the Blessed {@link iconButton} adapter. */
export interface IconButtonOptions {
  /** Optional dimensions, position, style, and standard Blessed settings. */
  box?: IconButtonBoxOptions;

  /** Icon, label, state, callback, and semantic colors. */
  data: IconButtonData;

  /** Blessed screen or node receiving the button. */
  parent: blessed.Widgets.Node;
}

/** Imperative handle returned by {@link iconButton}. */
export interface IconButtonHandle
  extends BlessedComponentHandle<IconButtonData, blessed.Widgets.BoxElement> {
  /** Gives terminal focus to an enabled button. */
  focus(): void;

  /** Activates an enabled button and reports whether activation occurred. */
  press(): boolean;
}

interface Keypress {
  full?: string;
  name?: string;
}

/**
 * Creates a keyboard and mouse accessible IconButton backed by a Blessed box.
 *
 * Enter and Space activate the button. The required label gives callers a
 * stable action description even when only the icon is visible.
 */
export function iconButton({
  box,
  data: initialData,
  parent,
}: IconButtonOptions): IconButtonHandle {
  let data = initialData;
  let focused = false;

  const element = blessed.box({
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const style = createBoxStyleController(element, box);
  const render = (): void => {
    const disabled = data.disabled === true;
    const foregroundTone = disabled
      ? (data.disabledTone ?? 'muted')
      : focused
        ? (data.focusedTone ?? 'foreground')
        : (data.tone ?? 'foreground');
    const backgroundTone = disabled
      ? (data.disabledBackgroundTone ?? 'background')
      : focused
        ? (data.focusedBackgroundTone ?? 'primary')
        : (data.backgroundTone ?? 'background');

    style.apply({
      backgroundTone,
      capabilities: data.capabilities,
      foregroundTone,
      theme: data.theme,
    });
    element.setContent(
      renderIconButton({
        disabled,
        focused,
        icon: data.icon,
        label: data.label,
        ...(data.showLabel === undefined ? {} : { showLabel: data.showLabel }),
        ...(data.variant === undefined ? {} : { variant: data.variant }),
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
      const wasFocused = element.screen.focused === element;

      removeFrom(element.screen.clickable);
      removeFrom(element.screen.keyable);

      if (wasFocused) {
        const screen = element.screen as typeof element.screen & {
          history: blessed.Widgets.BlessedElement[];
        };
        const previous = screen.history.toReversed().find((candidate) => candidate !== element);

        previous?.focus();
      }

      return;
    }

    element.enableInput();
  };
  const handle: IconButtonHandle = {
    destroy() {
      element.destroy();
    },
    element,
    focus() {
      if (data.disabled !== true) {
        element.focus();
      }
    },
    press() {
      if (data.disabled === true) {
        return false;
      }

      data.onPress?.();

      return true;
    },
    setData(nextData) {
      data = nextData;
      syncInteraction();
      render();
    },
  };

  element.on('blur', () => {
    focused = false;
    render();
  });
  element.on('click', () => {
    handle.press();
  });
  element.on('focus', () => {
    focused = true;
    render();
  });
  element.on('keypress', (_character: string, key: Keypress) => {
    switch (key.full ?? key.name) {
      case 'enter':
      case 'space':
        handle.press();
        break;
    }
  });

  syncInteraction();
  render();

  return handle;
}
