# Switch

`Switch` renders an immediate boolean setting with visible on/off markers,
optional custom state text, focus state, and disabled state.

```ts
import { renderSwitch } from 'blessed-components/switch';

renderSwitch({
  checked: true,
  label: 'Auto deploy',
  width: 24,
});
```

For Blessed apps, use the adapter:

```ts
import { switchControl } from 'blessed-components/switch/blessed';

const autoDeploy = switchControl({
  box: { height: 1, width: 32 },
  data: {
    label: 'Auto deploy',
    onCheckedChange(checked) {
      // Persist the setting.
    },
  },
  parent: screen,
});
```

Use `checked` for controlled state or `defaultChecked` for uncontrolled state.
Keyboard support includes Enter and Space.
