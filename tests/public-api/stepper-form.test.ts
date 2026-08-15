import { describe, expect, it, vi } from 'vitest';

import { createStepperFormState } from '@/index.js';

describe('StepperForm', () => {
  it('validates forward navigation and completes the final step', () => {
    let values = { email: '' };

    const onComplete = vi.fn();
    const onInvalid = vi.fn();
    const onStepChange = vi.fn();
    const flow = createStepperFormState({
      getValues: () => values,
      onComplete,
      onInvalid,
      onStepChange,
      steps: [
        { fields: ['email'], id: 'account', label: 'Account' },
        { id: 'confirm', label: 'Confirm' },
      ],
      validate(fields, currentValues) {
        return fields.includes('email') && currentValues.email === ''
          ? { email: 'Email is required' }
          : {};
      },
    });

    expect(flow.next()).toMatchObject({ ok: false, reason: 'invalid', stepId: 'account' });
    expect(onInvalid).toHaveBeenCalledWith('account', { email: 'Email is required' });

    values = { email: 'dev@example.com' };
    expect(flow.next()).toEqual({ completed: false, ok: true, stepId: 'confirm' });
    expect(onStepChange).toHaveBeenCalledWith('confirm', 'account');
    expect(flow.next()).toEqual({ completed: true, ok: true, stepId: 'confirm' });
    expect(onComplete).toHaveBeenCalledWith(values);
  });

  it('supports back and guarded direct navigation', () => {
    const flow = createStepperFormState({
      defaultStepId: 'two',
      getValues: () => ({}),
      steps: [
        { id: 'one', label: 'One' },
        { id: 'two', label: 'Two' },
        { id: 'three', label: 'Three' },
      ],
    });

    expect(flow.previous()).toMatchObject({ ok: true, stepId: 'one' });
    expect(flow.goTo('three')).toMatchObject({ ok: true, stepId: 'three' });
    expect(flow.goTo('missing')).toMatchObject({ ok: false, reason: 'out-of-range' });
  });

  it('validates step definitions and step-level errors', () => {
    expect(() => createStepperFormState({ getValues: () => ({}), steps: [] })).toThrow(RangeError);
    expect(() =>
      createStepperFormState({
        getValues: () => ({}),
        steps: [
          { id: 'same', label: 'One' },
          { id: 'same', label: 'Two' },
        ],
      }),
    ).toThrow(RangeError);

    const flow = createStepperFormState({
      getValues: () => ({}),
      steps: [{ id: 'account', label: 'Account', validate: () => 'Check this step' }],
    });

    expect(flow.validate()).toEqual({ account: 'Check this step' });
  });
});
