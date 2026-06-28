import { describe, expect, it } from 'vitest';

import { renderSwitch } from '@/index.js';

describe('Switch', () => {
  it('renders on and off states with focus and custom text', () => {
    expect(renderSwitch({ checked: true, label: 'Auto deploy' })).toBe('● Auto deploy: on');
    expect(
      renderSwitch({
        checked: false,
        focused: true,
        label: 'Auto deploy',
        offText: 'disabled',
        onText: 'enabled',
      }),
    ).toBe('› ○ Auto deploy: disabled');
  });

  it('renders disabled and truncates safely', () => {
    expect(
      renderSwitch({
        checked: true,
        disabled: true,
        label: '{bold}Danger mode{/bold}',
        width: 24,
      }),
    ).toBe('× Danger mode: on (disa…');
  });

  it('rejects invalid labels and dimensions', () => {
    expect(() => renderSwitch({ label: '', width: 10 })).toThrow(RangeError);
    expect(() => renderSwitch({ label: 'Auto\nDeploy', width: 10 })).toThrow(RangeError);
    expect(() => renderSwitch({ label: 'Auto deploy', width: -1 })).toThrow(RangeError);
  });
});
