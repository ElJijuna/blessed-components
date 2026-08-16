import { describe, expect, it, vi } from 'vitest';

import { createWizardState, renderWizard, STEP_INDICATOR_ASCII_MARKERS } from '@/index.js';

describe('Wizard', () => {
  it('guards forward navigation, allows back, and completes once', () => {
    let ready = false;

    const onComplete = vi.fn();
    const onStepChange = vi.fn();
    const flow = createWizardState({
      onComplete,
      onStepChange,
      steps: [
        {
          canAdvance: () => (ready ? true : 'Choose a target'),
          id: 'target',
          label: 'Target',
        },
        { id: 'review', label: 'Review' },
      ],
    });

    expect(flow.next()).toMatchObject({
      message: 'Choose a target',
      ok: false,
      reason: 'blocked',
      stepId: 'target',
    });

    ready = true;
    expect(flow.next()).toMatchObject({ action: 'navigate', ok: true, stepId: 'review' });
    expect(flow.previous()).toMatchObject({ action: 'navigate', ok: true, stepId: 'target' });
    expect(flow.goTo('review')).toMatchObject({ ok: true, stepId: 'review' });
    expect(flow.next()).toEqual({
      action: 'complete',
      ok: true,
      status: 'completed',
      stepId: 'review',
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(flow.next()).toMatchObject({ ok: false, reason: 'finished' });
    expect(onStepChange).toHaveBeenCalledTimes(3);
  });

  it('cancels once and can reset a finished flow', () => {
    const onCancel = vi.fn();
    const flow = createWizardState({
      onCancel,
      steps: [{ id: 'setup', label: 'Setup' }],
    });

    expect(flow.cancel()).toMatchObject({ action: 'cancel', status: 'cancelled' });
    expect(flow.cancel()).toMatchObject({ ok: false, reason: 'finished' });
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(flow.reset()).toMatchObject({ ok: true, status: 'active' });
    expect(flow.status()).toBe('active');
  });

  it('notifies when updated options replace the active step', () => {
    const onStepChange = vi.fn();
    const flow = createWizardState({
      onStepChange,
      steps: [
        { id: 'target', label: 'Target' },
        { id: 'review', label: 'Review' },
      ],
    });

    flow.next();
    onStepChange.mockClear();
    flow.setOptions({
      onStepChange,
      steps: [
        { id: 'target', label: 'Target' },
        { id: 'create', label: 'Create' },
      ],
    });

    expect(flow.activeStep().id).toBe('target');
    expect(onStepChange).toHaveBeenCalledWith('target', 'review');
  });

  it('validates steps and renders safe, bounded page content', () => {
    expect(() => createWizardState({ steps: [] })).toThrow(RangeError);
    expect(() =>
      createWizardState({
        steps: [
          { id: 'same', label: 'One' },
          { id: 'same', label: 'Two' },
        ],
      }),
    ).toThrow(RangeError);
    expect(() =>
      createWizardState({
        defaultStepId: 'missing',
        steps: [{ id: 'setup', label: 'Setup' }],
      }),
    ).toThrow(RangeError);

    const rendered = renderWizard({
      activeIndex: 1,
      markers: STEP_INDICATOR_ASCII_MARKERS,
      steps: [
        { id: 'target', label: 'Target' },
        {
          content: ['Deploy {bold}now{/bold}', '\u001b[31mNo ANSI\u001b[0m'],
          description: 'Final settings',
          id: 'review',
          label: 'Review',
          title: 'Review deployment',
        },
      ],
      width: 48,
    });

    expect(rendered).toContain('+ Target  > Review');
    expect(rendered).toContain('Review deployment');
    expect(rendered).toContain('Deploy now');
    expect(rendered).toContain('Complete');
    expect(rendered).not.toContain('\u001b[');
    expect(rendered).not.toContain('{bold}');
  });

  it('renders an entirely ASCII navigation footer with ASCII markers', () => {
    const rendered = renderWizard({
      markers: STEP_INDICATOR_ASCII_MARKERS,
      steps: [
        { id: 'target', label: 'Target' },
        { id: 'review', label: 'Review' },
      ],
      width: 48,
    });

    expect(rendered).toContain('(Back)  Next >');
    expect(rendered).not.toMatch(/[←→]/u);
  });
});
