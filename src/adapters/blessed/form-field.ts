import blessed from 'blessed';

import { type FormFieldCharacters, renderFormField } from '@/components/input/form-field/index.js';
import type { BlessedComponentHandle } from './types.js';

/** Blessed box options supported by the FormField adapter. */
export type FormFieldBoxOptions = Omit<blessed.Widgets.BoxOptions, 'content' | 'parent' | 'tags'>;

/** Stateful data accepted by the Blessed {@link formField} adapter. */
export interface FormFieldData {
  /** Character tokens used by the pure renderer. */
  characters?: FormFieldCharacters;

  /** Rendered control content, usually from another component renderer. */
  control: string;

  /** Error text. When present it takes precedence over `hint`. */
  error?: string;

  /** Hint text shown when no error is present. */
  hint?: string;

  /** Form field label. */
  label: string;

  /** Whether the label should include a required indicator. */
  required?: boolean;
}

/** Options accepted by the Blessed {@link formField} adapter. */
export interface FormFieldOptions {
  /** Position, dimensions, style, and standard Blessed box settings. */
  box?: FormFieldBoxOptions;

  /** Label, control text, hint, error, and marker data. */
  data: FormFieldData;

  /** Blessed screen or node receiving the created box. */
  parent: blessed.Widgets.Node;
}

/** Handle returned by {@link formField}. */
export type FormFieldHandle = BlessedComponentHandle<FormFieldData, blessed.Widgets.BoxElement>;

function numericDimension(value: blessed.Widgets.Types.TPosition): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

/** Creates a display-only FormField backed by a Blessed box. */
export function formField({ box, data: initialData, parent }: FormFieldOptions): FormFieldHandle {
  let data = initialData;

  const element = blessed.box({
    ...box,
    content: '',
    parent,
    tags: false,
  });
  const viewportSize = (): { height: number; width: number } => ({
    height: Math.max(0, numericDimension(element.height) - numericDimension(element.iheight)),
    width: Math.max(0, numericDimension(element.width) - numericDimension(element.iwidth)),
  });
  const render = (): void => {
    const dimensions = viewportSize();

    element.setContent(
      renderFormField({
        ...(data.characters === undefined ? {} : { characters: data.characters }),
        control: data.control,
        ...(data.error === undefined ? {} : { error: data.error }),
        height: dimensions.height,
        ...(data.hint === undefined ? {} : { hint: data.hint }),
        label: data.label,
        ...(data.required === undefined ? {} : { required: data.required }),
        width: dimensions.width,
      }),
    );
  };

  render();
  element.on('resize', render);

  return {
    destroy() {
      element.destroy();
    },
    element,
    setData(nextData) {
      data = nextData;
      render();
    },
  };
}
