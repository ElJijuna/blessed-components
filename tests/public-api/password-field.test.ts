import { describe, expect, it } from 'vitest';

import { renderPasswordField } from '@/index.js';

describe('PasswordField', () => {
  it('renders label, masked value, and hint', () => {
    expect(
      renderPasswordField({
        hint: 'Press Ctrl-R to reveal',
        label: 'Token',
        required: true,
        value: 'secret',
        width: 24,
      }),
    ).toBe('Token *:\n******\n? Press Ctrl-R to reveal');
  });

  it('renders focused revealed value and error', () => {
    expect(
      renderPasswordField({
        error: 'Rotate this token',
        focused: true,
        label: 'Token',
        reveal: true,
        value: 'secret',
        width: 18,
      }),
    ).toBe('Token:\n> secret show\n! Rotate this tok…');
  });

  it('sanitizes markup and rejects invalid input', () => {
    expect(
      renderPasswordField({
        label: '{bold}Token{/bold}',
        placeholder: '{gray-fg}paste token{/gray-fg}',
        value: '',
        width: 16,
      }),
    ).toBe('Token:\npaste token');

    expect(() =>
      renderPasswordField({ label: 'Token', value: 'secret\nvalue', width: 12 }),
    ).toThrow(RangeError);
    expect(() =>
      renderPasswordField({
        characters: { empty: ' ', error: '!', focused: '>', hint: '?', mask: '', reveal: 'show' },
        label: 'Token',
        value: 'secret',
        width: 12,
      }),
    ).toThrow(RangeError);
    expect(() => renderPasswordField({ label: 'Token', width: -1 })).toThrow(RangeError);
  });
});
