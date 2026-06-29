import { describe, expect, it, vi } from 'vitest';

import { createFormState } from '@/index.js';

describe('Form', () => {
  it('registers fields, validates, and submits values', () => {
    const onSubmit = vi.fn();
    const onValidation = vi.fn();
    const form = createFormState({
      fields: [
        {
          defaultValue: '',
          id: 'environment',
          validate(value) {
            return value === '' ? 'Environment is required' : undefined;
          },
        },
      ],
      onSubmit,
      onValidation,
    });

    expect(form.submit()).toEqual({
      errors: { environment: 'Environment is required' },
      ok: false,
      values: { environment: '' },
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onValidation).toHaveBeenCalledWith(
      { environment: 'Environment is required' },
      { environment: '' },
    );

    expect(form.setValue('environment', 'production')).toBe(true);
    expect(form.submit()).toEqual({
      ok: true,
      values: { environment: 'production' },
    });
    expect(onSubmit).toHaveBeenCalledWith({ environment: 'production' });
  });

  it('supports reset and duplicate-id protection', () => {
    const onReset = vi.fn();
    const form = createFormState({
      fields: [{ defaultValue: 'prod', id: 'environment' }],
      onReset,
    });

    form.setValue('environment', 'staging');

    expect(form.values()).toEqual({ environment: 'staging' });
    expect(form.reset()).toEqual({ environment: 'prod' });
    expect(onReset).toHaveBeenCalledWith({ environment: 'prod' });
    expect(() => form.registerField({ id: 'environment' })).toThrow(RangeError);
  });

  it('keeps controlled values unchanged until options change', () => {
    const onValueChange = vi.fn();
    const form = createFormState({
      fields: [{ id: 'slug', onValueChange, value: 'prod' }],
    });

    form.setValue('slug', 'beta');

    expect(onValueChange).toHaveBeenCalledWith('beta', { slug: 'prod' });
    expect(form.values()).toEqual({ slug: 'prod' });

    form.setOptions({
      fields: [{ id: 'slug', onValueChange, value: 'beta' }],
    });

    expect(form.values()).toEqual({ slug: 'beta' });
  });
});
