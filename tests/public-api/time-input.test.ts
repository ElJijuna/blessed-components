import { describe, expect, it } from 'vitest';

import { parseTimeInput, renderTimeInput } from '@/index.js';

describe('TimeInput', () => {
  it('renders safe time text and validates 24-hour values with bounds', () => {
    expect(renderTimeInput({ label: 'Run at', value: '\u001B[31m09:30\u001B[0m', width: 16 })).toBe(
      ['Run at:', '09:30', '? HH:mm'].join('\n'),
    );
    expect(parseTimeInput('24:00')).toEqual({ input: '24:00', reason: 'invalid', valid: false });
    expect(parseTimeInput('09:30', { max: '17:00', min: '09:00' })).toEqual({
      input: '09:30',
      minutes: 570,
      valid: true,
    });
  });
});
