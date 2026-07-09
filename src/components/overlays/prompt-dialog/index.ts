import { renderPlainLines } from '@/components/shared/text.js';

/** Options accepted by {@link renderPromptDialog}. */
export interface RenderPromptDialogOptions {
  /** Cancel action label. */
  cancelLabel?: string;

  /** Current input value. */
  defaultValue?: string;

  /** Error text shown below the value. */
  error?: string;

  /** Maximum rendered height. */
  height?: number;

  /** Helpful text shown below the message. */
  hint?: string;

  /** Main prompt message. */
  message: string;

  /** Confirm action label. */
  submitLabel?: string;

  /** Dialog title. */
  title: string;

  /** Maximum terminal-cell width of each line. */
  width?: number;
}

/** Renders modal prompt content without owning focus or input state. */
export function renderPromptDialog({
  cancelLabel = 'Cancel',
  defaultValue = '',
  error,
  height,
  hint,
  message,
  submitLabel = 'OK',
  title,
  width,
}: RenderPromptDialogOptions): string {
  const lines = [
    title,
    message,
    `> ${defaultValue}`,
    ...(error === undefined ? (hint === undefined ? [] : [`? ${hint}`]) : [`! ${error}`]),
    `[${submitLabel}] [${cancelLabel}]`,
  ];

  return renderPlainLines(lines, { height, width });
}
