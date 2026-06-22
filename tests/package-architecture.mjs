import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

const expectedComponents = [
  'src/components/layout/box/index.ts',
  'src/components/input/button/index.ts',
  'src/components/layout/card/index.ts',
  'src/components/layout/divider/index.ts',
  'src/components/layout/scroll-area/index.ts',
  'src/components/layout/stack/index.ts',
  'src/components/layout/viewport/index.ts',
  'src/components/overlays/dialog/index.ts',
  'src/components/data-display/badge/index.ts',
  'src/components/data-display/key-value/index.ts',
  'src/components/collections/list/index.ts',
  'src/components/data-display/stat/index.ts',
  'src/components/data-display/text/index.ts',
  'src/components/feedback/progress-bar/index.ts',
  'src/components/feedback/spinner/index.ts',
  'src/components/visualization/metric-bars/index.ts',
  'src/components/visualization/sparkline/index.ts',
];
const legacyComponents = [
  'src/components/data-display/list/index.ts',
  'src/components/badge/index.ts',
  'src/components/stat/index.ts',
  'src/components/progress-bar/index.ts',
  'src/components/metric-bars/index.ts',
  'src/components/sparkline/index.ts',
];

for (const path of expectedComponents) {
  await access(path);
}

for (const path of legacyComponents) {
  await assert.rejects(access(path), undefined, `Legacy component path still exists: ${path}`);
}

console.log('Component source architecture verified.');
